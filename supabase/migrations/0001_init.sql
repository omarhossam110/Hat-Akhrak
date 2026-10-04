-- Hat Akhrak (هات آخرك) — initial schema
-- Group-buying marketplace: merchants list deals, buyers join 72h cycles,
-- price drops retroactively in tiers as more buyers join (Pinduoduo-style).
-- This migration is written for Supabase (Postgres + auth.users + RLS).

-- =========================================================================
-- ENUMS
-- =========================================================================

create type user_role as enum ('customer', 'merchant', 'super_admin');

create type deal_status as enum ('active', 'paused', 'cancelled');

create type cycle_status as enum (
  'active',       -- currently collecting buyers, within 72h window
  'succeeded',    -- reached the window end (or stock sold out) with >=1 tier reached
  'failed',       -- did not reach the first tier (5 buyers) before the window ended
  'held',         -- remaining deal stock dropped below 5 units; cycle paused until merchant tops up stock
  'cancelled'     -- cancelled by merchant (no deposits yet) or emergency-cancelled by super admin
);

create type order_status as enum (
  'deposit_paid',       -- buyer paid the deposit, cycle still active
  'awaiting_balance',   -- cycle succeeded, remaining balance due on delivery
  'balance_paid',       -- balance paid at the door (QR/payment link), before handover
  'delivered',          -- item handed over, 48h inspection window running
  'completed',          -- inspection window passed with no dispute
  'cancelled_by_buyer',     -- buyer cancelled within 24h-of-deposit / before final-24h freeze
  'refused_by_buyer',       -- buyer refused delivery (their own fault) — partial refund per policy
  'disputed',               -- buyer raised a dispute (merchant-fault refusal, wrong/damaged/late item)
  'refunded'                -- fully refunded after dispute resolution in the buyer's favor
);

create type payment_type as enum ('deposit', 'balance', 'refund', 'payout');

create type payment_status as enum ('pending', 'succeeded', 'failed', 'reversed');

create type dispute_status as enum ('open', 'investigating', 'resolved_buyer', 'resolved_merchant');

-- =========================================================================
-- PROFILES (extends auth.users)
-- =========================================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null default 'customer',
  full_name text not null,
  phone text,
  created_at timestamptz not null default now()
);

-- =========================================================================
-- MERCHANTS
-- =========================================================================

create table public.merchants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  business_name text not null,
  -- Tax ID / registration & branch info: visible only to the merchant themselves
  -- and super admin — never exposed to customers (enforced via RLS + API layer,
  -- never selected into any public-facing query).
  tax_id text,
  branch_info text,
  is_verified boolean not null default false,
  rating numeric(3, 2) not null default 0,
  member_since timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index merchants_user_id_idx on public.merchants (user_id);

-- =========================================================================
-- DEALS
-- =========================================================================

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  title text not null,
  title_ar text,
  title_en text,
  description text,
  images text[] not null default '{}',
  wholesale_unit_price numeric(10, 2) not null check (wholesale_unit_price > 0),
  -- Total stock must be a multiple of 5 (tier math depends on groups of 5 buyers).
  total_stock integer not null check (total_stock > 0 and total_stock % 5 = 0),
  remaining_stock integer not null check (remaining_stock >= 0),
  status deal_status not null default 'active',
  -- Price cannot be edited once created — merchant must cancel & recreate instead.
  -- Enforced at the application layer (no UPDATE path exposed for this column).
  created_at timestamptz not null default now(),
  cancelled_at timestamptz,
  constraint remaining_stock_within_total check (remaining_stock <= total_stock)
);

-- Per-deal tier pricing. Tier bands are fixed platform-wide:
--   tier 1 =  5-9 buyers
--   tier 2 = 10-14 buyers
--   tier 3 = 15-20 buyers (cycle cap)
-- price_per_unit for each tier is derived from wholesale_unit_price + the
-- commission/margin algorithm (tiered net platform margin, gateway fee baked in).
create table public.deal_tiers (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals (id) on delete cascade,
  tier_number smallint not null check (tier_number in (1, 2, 3)),
  min_buyers smallint not null,
  max_buyers smallint not null,
  price_per_unit numeric(10, 2) not null check (price_per_unit > 0),
  unique (deal_id, tier_number)
);

-- =========================================================================
-- CYCLES
-- =========================================================================

create table public.cycles (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals (id) on delete cascade,
  cycle_number integer not null,
  status cycle_status not null default 'active',
  -- Units carved out of the deal's remaining_stock for this cycle (max 20 per
  -- the tier-3 cap); recomputed down as units are purchased.
  stock_allocated integer not null check (stock_allocated > 0 and stock_allocated <= 20),
  units_sold integer not null default 0,
  -- Highest tier reached so far — every buyer in the cycle is ultimately
  -- charged this tier's price (retroactive Pinduoduo-style pricing).
  final_tier_reached smallint check (final_tier_reached in (1, 2, 3)),
  started_at timestamptz not null default now(),
  -- 72-hour purchasing window.
  ends_at timestamptz not null,
  -- Cycle is frozen (no new joins, no cancellations) during its final 24h,
  -- to protect the tier already reached.
  freeze_at timestamptz not null,
  cancel_reason text,
  cancelled_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (deal_id, cycle_number)
);

create index cycles_deal_id_idx on public.cycles (deal_id);
create index cycles_status_idx on public.cycles (status);

-- =========================================================================
-- ORDERS (a customer's participation in a cycle)
-- =========================================================================

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.cycles (id) on delete cascade,
  customer_id uuid not null references public.profiles (id),
  -- Max 2 units per customer per cycle.
  units smallint not null check (units >= 1 and units <= 2),
  -- Deposit is a variable fixed amount per product (covers potential refusal
  -- costs: shipping + return + 1% admin fee), collected up front and never
  -- recalculated even if the final tier price changes.
  deposit_amount numeric(10, 2) not null check (deposit_amount >= 0),
  -- Balance is recalculated once the cycle's final tier is known
  -- (final_tier price * units) - deposit_amount.
  balance_amount numeric(10, 2),
  final_unit_price numeric(10, 2),
  status order_status not null default 'deposit_paid',
  -- Buyer may cancel/get refunded within 24h of paying the deposit, unless
  -- the cycle has already entered its final-24h freeze window.
  cancel_deadline timestamptz not null,
  delivered_at timestamptz,
  -- 48h inspection window starts at delivery.
  inspection_deadline timestamptz,
  delivery_invoice_photo_url text,
  created_at timestamptz not null default now(),
  unique (cycle_id, customer_id, units) deferrable initially deferred
);

create index orders_cycle_id_idx on public.orders (cycle_id);
create index orders_customer_id_idx on public.orders (customer_id);

-- Enforce "max 2 units per customer per cycle" across possibly-multiple order rows.
create or replace function public.check_customer_cycle_unit_limit()
returns trigger as $$
declare
  total_units integer;
begin
  select coalesce(sum(units), 0) into total_units
  from public.orders
  where cycle_id = new.cycle_id
    and customer_id = new.customer_id
    and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
    and status not in ('cancelled_by_buyer', 'refunded');

  if total_units + new.units > 2 then
    raise exception 'Customer % already holds % unit(s) in cycle % — max 2 per cycle',
      new.customer_id, total_units, new.cycle_id;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger orders_unit_limit_check
  before insert or update on public.orders
  for each row execute function public.check_customer_cycle_unit_limit();

-- =========================================================================
-- PAYMENTS / LEDGER
-- All merchant payouts route through the super admin — merchants never
-- receive disputed funds directly.
-- =========================================================================

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete cascade,
  merchant_id uuid references public.merchants (id),
  type payment_type not null,
  amount numeric(10, 2) not null,
  gateway_ref text,
  status payment_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index payments_order_id_idx on public.payments (order_id);
create index payments_merchant_id_idx on public.payments (merchant_id);

-- =========================================================================
-- DISPUTES
-- Buyer disputes a merchant-fault refusal (wrong/damaged/late item) via
-- support (WhatsApp) with cycle ID + transaction ID; super admin investigates.
-- =========================================================================

create table public.disputes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  raised_by uuid not null references public.profiles (id),
  reason text not null,
  status dispute_status not null default 'open',
  resolution_notes text,
  resolved_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index disputes_order_id_idx on public.disputes (order_id);

-- =========================================================================
-- MERCHANT ALERTS (repeated consecutive failed cycles on a deal)
-- =========================================================================

create table public.merchant_alerts (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  deal_id uuid not null references public.deals (id) on delete cascade,
  consecutive_failed_cycles integer not null,
  message text not null,
  acknowledged boolean not null default false,
  created_at timestamptz not null default now()
);

-- =========================================================================
-- ROW LEVEL SECURITY
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.merchants enable row level security;
alter table public.deals enable row level security;
alter table public.deal_tiers enable row level security;
alter table public.cycles enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.disputes enable row level security;
alter table public.merchant_alerts enable row level security;

create or replace function public.current_role()
returns user_role as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer;

-- Profiles: everyone can read their own row; super admins read all.
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.current_role() = 'super_admin');

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- Deals & tiers: public read (guests browse without an account).
create policy "deals_public_read" on public.deals for select using (true);
create policy "deal_tiers_public_read" on public.deal_tiers for select using (true);

create policy "deals_merchant_write" on public.deals
  for insert with check (
    merchant_id in (select id from public.merchants where user_id = auth.uid())
    or public.current_role() = 'super_admin'
  );

create policy "deals_merchant_update" on public.deals
  for update using (
    merchant_id in (select id from public.merchants where user_id = auth.uid())
    or public.current_role() = 'super_admin'
  );

-- Cycles: public read (live timer / participant count on the storefront).
create policy "cycles_public_read" on public.cycles for select using (true);

-- Merchants: public can read non-sensitive columns via a view (see below);
-- raw table access restricted to the merchant themselves and super admin.
create policy "merchants_self_or_admin" on public.merchants
  for select using (user_id = auth.uid() or public.current_role() = 'super_admin');

create policy "merchants_update_self" on public.merchants
  for update using (user_id = auth.uid() or public.current_role() = 'super_admin');

-- Orders: customers see only their own orders; merchants see orders on their
-- deals (no direct fund access); super admin sees everything.
create policy "orders_customer_own" on public.orders
  for select using (
    customer_id = auth.uid()
    or public.current_role() = 'super_admin'
    or cycle_id in (
      select c.id from public.cycles c
      join public.deals d on d.id = c.deal_id
      join public.merchants m on m.id = d.merchant_id
      where m.user_id = auth.uid()
    )
  );

create policy "orders_customer_insert" on public.orders
  for insert with check (customer_id = auth.uid());

-- Payments & disputes: restricted to the parties involved + super admin.
create policy "payments_owner_or_admin" on public.payments
  for select using (
    public.current_role() = 'super_admin'
    or merchant_id in (select id from public.merchants where user_id = auth.uid())
    or order_id in (select id from public.orders where customer_id = auth.uid())
  );

create policy "disputes_owner_or_admin" on public.disputes
  for select using (
    raised_by = auth.uid()
    or public.current_role() = 'super_admin'
    or order_id in (
      select o.id from public.orders o
      join public.cycles c on c.id = o.cycle_id
      join public.deals d on d.id = c.deal_id
      join public.merchants m on m.id = d.merchant_id
      where m.user_id = auth.uid()
    )
  );

create policy "disputes_insert_own" on public.disputes
  for insert with check (raised_by = auth.uid());

create policy "merchant_alerts_self_or_admin" on public.merchant_alerts
  for select using (
    public.current_role() = 'super_admin'
    or merchant_id in (select id from public.merchants where user_id = auth.uid())
  );

-- =========================================================================
-- PUBLIC MERCHANT PROFILE VIEW (name, rating, verified badge — no tax ID)
-- =========================================================================

create view public.merchant_public_profiles as
select
  id,
  business_name,
  is_verified,
  rating,
  member_since
from public.merchants;

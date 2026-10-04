import { getTranslations, getLocale } from "next-intl/server";
import type { MockDealCard } from "@/lib/mock-deals";
import { CycleCountdown } from "@/components/cycle-countdown";

export async function DealCard({ card }: { card: MockDealCard }) {
  const t = await getTranslations();
  const locale = await getLocale();

  const { deal, tiers, cycle, merchant, gradient } = card;
  const title = locale === "ar" ? deal.title_ar ?? deal.title : deal.title_en ?? deal.title;

  // Buyers joined so far this cycle = units_sold is a reasonable stand-in
  // for the mock (1 order ≈ 1-2 units); real logic will count distinct
  // participating customers.
  const buyersJoined = cycle.units_sold;
  const maxTier = tiers[tiers.length - 1];
  const progressPct = Math.min(100, (buyersJoined / maxTier.max_buyers) * 100);

  const activeTier = cycle.final_tier_reached
    ? tiers.find((tr) => tr.tier_number === cycle.final_tier_reached)
    : tiers[0];

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md">
      <div className={`h-36 w-full bg-gradient-to-br ${gradient}`} />

      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-bold text-navy-950 sm:text-lg">{title}</h3>
          {merchant.is_verified && (
            <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-navy-700">
              ✓ {t("deals.verifiedMerchant")}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-neutral-500">{merchant.business_name}</p>

        {/* Current price */}
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold text-orange-600">
            {activeTier?.price_per_unit}
          </span>
          <span className="text-sm text-neutral-500">
            {t("common.egp")} {t("deals.perUnit")}
          </span>
        </div>

        {/* Tier pills */}
        <div className="mt-3 flex gap-1.5">
          {tiers.map((tier) => {
            const reached = cycle.final_tier_reached !== null && cycle.final_tier_reached >= tier.tier_number;
            return (
              <span
                key={tier.id}
                className={`flex-1 rounded-lg px-2 py-1.5 text-center text-xs font-semibold ${
                  reached
                    ? "bg-orange-500 text-white"
                    : "bg-neutral-100 text-neutral-500"
                }`}
              >
                {t("deals.tier", { number: tier.tier_number })}
                <br />
                {tier.price_per_unit}
              </span>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-orange-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-neutral-500">
          <span>{t("deals.buyersJoined", { count: buyersJoined })}</span>
          <span>{t("deals.unitsLeft", { count: deal.remaining_stock })}</span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
          <CycleCountdown endsAt={cycle.ends_at} />
          <button className="rounded-lg bg-navy-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-800">
            {t("deals.joinNow")}
          </button>
        </div>
      </div>
    </div>
  );
}

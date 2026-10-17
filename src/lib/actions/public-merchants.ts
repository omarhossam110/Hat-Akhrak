import { backendFetch } from "@/lib/backend/client";
import { getDeals } from "@/lib/actions/public-deals";
import type { MockMerchantProfile } from "@/lib/mock-merchants";
import type { MockDealCard } from "@/lib/mock-deals";

// Wired to the real backend (GET /merchants, GET /merchants/:id — both
// public, never exposing tax_id/branch_info). Mapped onto the existing
// MockMerchantProfile shape so the listing/profile pages' JSX needed no
// changes beyond the data source.

type BackendMerchant = {
  id: string;
  businessName: string;
  isVerified: boolean;
  rating: string;
  reviewCount: number;
  memberSince: string;
};

// Cosmetic only, same reasoning as public-deals.ts's icon/artVariant: the
// backend has no avatar-color column, so this is derived deterministically
// just to keep the grid visually varied.
const AVATAR_VARIANTS: MockMerchantProfile["avatarVariant"][] = ["a", "b", "c", "d"];
function hashIndex(id: string, mod: number) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return hash % mod;
}

// No bio field exists on the backend yet (merchant signup never asked for
// one) — a real per-merchant bio needs a schema change + a new signup-form
// field, which is its own separate piece of work, not something to invent
// silently here. Generic placeholder text until that's built.
const GENERIC_BIO_AR = "تاجر على هات آخرك، بيبيع بسعر الجملة من خلال صفقات جماعية.";
const GENERIC_BIO_EN = "A merchant on Hat Akhrak, selling at wholesale prices through group deals.";

function completedDealsFor(merchantId: string, deals: MockDealCard[]) {
  // "Completed" = a cycle that actually reached a successful close —
  // real, not a placeholder, it's just 0 for every merchant right now
  // since cycle lifecycle transitions (active → succeeded/failed) aren't
  // implemented on the backend yet (every cycle just stays "active").
  return deals
    .filter((d) => d.deal.merchant_id === merchantId)
    .reduce((sum, d) => sum + (d.cycle.status === "succeeded" ? 1 : 0), 0);
}

function toProfile(
  m: BackendMerchant,
  completedDeals: number,
): MockMerchantProfile {
  return {
    id: m.id,
    business_name: m.businessName,
    is_verified: m.isVerified,
    rating: Number(m.rating),
    review_count: m.reviewCount ?? 0,
    completed_deals: completedDeals,
    member_since: new Date(m.memberSince).getFullYear().toString(),
    bio_ar: GENERIC_BIO_AR,
    bio_en: GENERIC_BIO_EN,
    avatarVariant: AVATAR_VARIANTS[hashIndex(m.id, AVATAR_VARIANTS.length)],
  };
}

/** All merchants (public, no auth) — used by the Merchants listing page.
 * Degrades to an empty list rather than throwing on a backend hiccup. */
export async function getMerchants(): Promise<MockMerchantProfile[]> {
  try {
    const [rows, deals] = await Promise.all([
      backendFetch<BackendMerchant[]>("/merchants"),
      getDeals(),
    ]);
    return rows.map((m) => toProfile(m, completedDealsFor(m.id, deals)));
  } catch {
    return [];
  }
}

/** A single merchant's public profile by id. Returns null on a 404 or any
 * other backend error, so the caller can render its existing not-found
 * state either way. */
export async function getMerchant(id: string): Promise<MockMerchantProfile | null> {
  try {
    const [row, deals] = await Promise.all([
      backendFetch<BackendMerchant>(`/merchants/${id}`),
      getDeals(),
    ]);
    return toProfile(row, completedDealsFor(id, deals));
  } catch {
    return null;
  }
}

/** This merchant's currently-open (active) deals, for their public
 * profile's "Open Deals" grid. */
export async function getOpenDealsByMerchant(id: string): Promise<MockDealCard[]> {
  const deals = await getDeals();
  return deals.filter((d) => d.deal.merchant_id === id && d.deal.status === "active");
}

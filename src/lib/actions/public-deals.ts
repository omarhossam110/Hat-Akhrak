import { backendFetch } from "@/lib/backend/client";
import type { MockDealCard } from "@/lib/mock-deals";

// Wired to the real backend (GET /deals, GET /deals/:id — both public).
// Mapped onto the exact MockDealCard shape the UI already expects
// (deal/tiers/cycle/merchant + a couple of cosmetic-only fields), so every
// consumer that already rendered mockDeals — DealCard, DealsExplorer,
// header search, the homepage sections, the payment page, wishlist — needed
// no changes beyond swapping where the data comes from.

type BackendTier = {
  id: string;
  tierNumber: 1 | 2 | 3;
  minBuyers: number;
  maxBuyers: number;
  pricePerUnit: string;
};
type BackendCycle = {
  id: string;
  cycleNumber: number;
  status: "active" | "succeeded" | "failed" | "held" | "cancelled";
  stockAllocated: number;
  unitsSold: number;
  finalTierReached: 1 | 2 | 3 | null;
  startedAt: string;
  endsAt: string;
  freezeAt: string;
  cancelReason: string | null;
  cancelledBy: string | null;
  createdAt: string;
};
type BackendDeal = {
  id: string;
  merchantId: string;
  categoryId: string | null;
  title: string;
  titleAr: string | null;
  titleEn: string | null;
  description: string | null;
  images: string[];
  wholesaleUnitPrice: string;
  totalStock: number;
  remainingStock: number;
  status: "active" | "paused" | "cancelled";
  createdAt: string;
  cancelledAt: string | null;
  category: { id: string; slug: string } | null;
  merchant: { businessName: string; isVerified: boolean; rating: string; reviewCount: number };
  tiers: BackendTier[];
  cycles: BackendCycle[];
  currentCycle?: BackendCycle;
  currentPrice: number | null;
  depositAmount: number;
};

// Cosmetic only — the backend has no icon/color-variant columns, so these
// are derived deterministically from fields that do exist, purely so the
// product-art tiles stay visually varied instead of every deal looking
// identical. Real photography (deal.images) takes over whenever a merchant
// actually uploads some.
const CATEGORY_ICONS: Record<string, string> = {
  "mobiles-accessories": "📱",
  electronics: "🔌",
  fashion: "👟",
  "home-kitchen": "🍳",
  "beauty-personal-care": "💄",
  groceries: "🛒",
  "toys-kids": "🧸",
  "sports-outdoors": "🏋️",
  "books-stationery": "📚",
  "watches-accessories": "⌚",
};
const ART_VARIANTS: MockDealCard["artVariant"][] = ["a", "b", "c", "d"];

function hashIndex(id: string, mod: number) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return hash % mod;
}

function toCard(row: BackendDeal): MockDealCard | null {
  // Every deal is created with cycle #1 at creation time (see
  // hat-akhrak-backend's DealsService.create), so this shouldn't happen in
  // practice — skip defensively rather than crash the page on a gap.
  const cycle = row.currentCycle ?? row.cycles[0];
  if (!cycle) return null;

  const wholesaleUnitPrice = Number(row.wholesaleUnitPrice);
  const categorySlug = row.category?.slug;

  return {
    deal: {
      id: row.id,
      merchant_id: row.merchantId,
      category_id: row.categoryId,
      title: row.title,
      title_ar: row.titleAr,
      title_en: row.titleEn,
      description: row.description,
      images: row.images,
      wholesale_unit_price: wholesaleUnitPrice,
      total_stock: row.totalStock,
      remaining_stock: row.remainingStock,
      status: row.status,
      created_at: row.createdAt,
      cancelled_at: row.cancelledAt,
    },
    tiers: row.tiers.map((t) => ({
      id: t.id,
      deal_id: row.id,
      tier_number: t.tierNumber,
      min_buyers: t.minBuyers,
      max_buyers: t.maxBuyers,
      price_per_unit: Number(t.pricePerUnit),
    })),
    cycle: {
      id: cycle.id,
      deal_id: row.id,
      cycle_number: cycle.cycleNumber,
      status: cycle.status,
      stock_allocated: cycle.stockAllocated,
      units_sold: cycle.unitsSold,
      final_tier_reached: cycle.finalTierReached,
      started_at: cycle.startedAt,
      ends_at: cycle.endsAt,
      freeze_at: cycle.freezeAt,
      cancel_reason: cycle.cancelReason,
      cancelled_by: cycle.cancelledBy,
      created_at: cycle.createdAt,
    },
    merchant: {
      business_name: row.merchant.businessName,
      is_verified: row.merchant.isVerified,
      rating: Number(row.merchant.rating),
      review_count: row.merchant.reviewCount ?? 0,
    },
    icon: (categorySlug && CATEGORY_ICONS[categorySlug]) || "🛍️",
    artVariant: ART_VARIANTS[hashIndex(row.id, ART_VARIANTS.length)],
    // Real formula now, computed server-side from the spec's commission
    // table (see hat-akhrak-backend's pricing.ts computeDeposit()) — no
    // longer a flat client-side guess.
    depositAmount: row.depositAmount,
  };
}

/** All active deals (public, no auth) — used by the Deals browse page, the
 * homepage sections, header search, and Super Admin analytics. Degrades to
 * an empty list rather than throwing on a backend hiccup. */
export async function getDeals(): Promise<MockDealCard[]> {
  try {
    const rows = await backendFetch<BackendDeal[]>("/deals");
    return rows.map(toCard).filter((c): c is MockDealCard => c !== null);
  } catch {
    return [];
  }
}

/** A single deal by id (public, no auth) — used by the deal-detail and
 * payment pages. Returns null on a 404 or any other backend error, so
 * callers can render their existing not-found state either way. */
export async function getDeal(id: string): Promise<MockDealCard | null> {
  try {
    const row = await backendFetch<BackendDeal>(`/deals/${id}`);
    return toCard(row);
  } catch {
    return null;
  }
}

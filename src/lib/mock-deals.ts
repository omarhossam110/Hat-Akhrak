import type { Deal, DealTier, Cycle } from "@/lib/types/database";

/**
 * Shared type for a deal card's full data. Originally backed by mock data;
 * now populated for real from src/lib/actions/public-deals.ts (GET /deals,
 * GET /deals/:id) — this type definition stayed put since DealCard,
 * DealsExplorer, header search, and every page that renders a deal grid
 * all already depend on this exact shape, so wiring the real backend was a
 * drop-in change of where the data comes from.
 */
export interface MockDealCard {
  deal: Deal;
  tiers: DealTier[];
  cycle: Cycle;
  merchant: {
    business_name: string;
    is_verified: boolean;
    rating: number;
    review_count: number;
  };
  icon: string;
  artVariant: "a" | "b" | "c" | "d";
  /**
   * Deposit amount (variable per product, covers potential refusal costs
   * per the spec) — computed server-side from the spec's category/tier
   * commission table (hat-akhrak-backend's pricing.ts computeDeposit()),
   * same source the tier prices come from. See public-deals.ts for the
   * mapping.
   */
  depositAmount: number;
}

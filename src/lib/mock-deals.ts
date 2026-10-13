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
   * Illustrative deposit amount (variable per product, covers potential
   * refusal costs per the spec) — real value will come from the deposit
   * formula once it's implemented server-side; see public-deals.ts's
   * estimateDeposit() for the current placeholder.
   */
  depositAmount: number;
}

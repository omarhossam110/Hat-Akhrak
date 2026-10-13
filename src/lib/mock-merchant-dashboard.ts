/**
 * Shared types for the Merchant Dashboard's deals table. Originally backed
 * by mock data; now populated for real from
 * src/lib/actions/merchant-deals.ts (GET /deals/mine) — these type
 * definitions stayed put since merchant-deals-table.tsx and the real
 * mapping function both already depend on this exact shape.
 */

export type MerchantDealStatus = "active" | "needs_stock" | "paused";
export type CycleOutcome = "succeeded" | "failed" | "active";

export interface MerchantCycleHistoryItem {
  id: string;
  label_ar: string;
  label_en: string;
  outcome: CycleOutcome;
  amount: number | null;
}

export interface MerchantDealRow {
  dealId: string;
  title_ar: string;
  title_en: string;
  remainingStock: number;
  totalStock: number;
  currentCycleSold: number;
  currentCycleStock: number;
  currentTier: 1 | 2 | 3 | null;
  status: MerchantDealStatus;
  history: MerchantCycleHistoryItem[];
}

export interface MerchantDashboardStats {
  totalDeals: number;
  unitsSold: number;
  revenue: number;
}

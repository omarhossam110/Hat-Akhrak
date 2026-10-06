/**
 * Placeholder data for the Merchant Dashboard until real auth + Supabase
 * queries are wired up (scoped to the signed-in merchant_id). Shapes are
 * deliberately close to the real `deals`/`cycles` tables so swapping to
 * live queries later is a drop-in change.
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

export const merchantStats: MerchantDashboardStats = {
  totalDeals: 12,
  unitsSold: 840,
  revenue: 38500,
};

export const merchantHasAlert = true;

export const merchantDeals: MerchantDealRow[] = [
  {
    dealId: "d1",
    title_ar: "سماعة بلوتوث لاسلكية",
    title_en: "Wireless Bluetooth Earbuds",
    remainingStock: 120,
    totalStock: 200,
    currentCycleSold: 10,
    currentCycleStock: 20,
    currentTier: 2,
    status: "active",
    history: [
      { id: "h1", label_ar: "دورة #11 • 10–14 مشترك", label_en: "Cycle #11 • 10–14 buyers", outcome: "succeeded", amount: 4970 },
      { id: "h2", label_ar: "دورة #10 • 5–9 مشترك", label_en: "Cycle #10 • 5–9 buyers", outcome: "succeeded", amount: 2150 },
      { id: "h3", label_ar: "دورة #9", label_en: "Cycle #9", outcome: "failed", amount: null },
    ],
  },
  {
    dealId: "d2",
    title_ar: "طقم مقالي تيفال",
    title_en: "Tefal Non-Stick Cookware Set",
    remainingStock: 15,
    totalStock: 50,
    currentCycleSold: 3,
    currentCycleStock: 5,
    currentTier: null,
    status: "needs_stock",
    history: [
      { id: "h4", label_ar: "دورة #4", label_en: "Cycle #4", outcome: "failed", amount: null },
      { id: "h5", label_ar: "دورة #3 • 5–9 مشترك", label_en: "Cycle #3 • 5–9 buyers", outcome: "succeeded", amount: 1340 },
    ],
  },
];

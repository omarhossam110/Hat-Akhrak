"use server";

import { backendFetch } from "@/lib/backend/client";
import { postAction, type ActionState } from "@/lib/backend/post-action";
import { getSessionToken } from "@/lib/auth/session";
import type {
  MerchantCycleHistoryItem,
  MerchantDashboardStats,
  MerchantDealRow,
} from "@/lib/mock-merchant-dashboard";

// Wired to the real backend (GET /deals/mine) — replaces the old
// mock-merchant-dashboard data entirely. Shapes are mapped onto the exact
// same MerchantDealRow/MerchantDashboardStats types the UI already expects,
// so merchant-deals-table.tsx itself needed no changes.

type BackendTier = { tierNumber: 1 | 2 | 3; minBuyers: number; maxBuyers: number; pricePerUnit: string };
type BackendCycle = {
  id: string;
  cycleNumber: number;
  status: "active" | "succeeded" | "failed" | "held" | "cancelled";
  stockAllocated: number;
  unitsSold: number;
  finalTierReached: 1 | 2 | 3 | null;
};
type BackendDeal = {
  id: string;
  titleAr: string;
  titleEn: string;
  totalStock: number;
  remainingStock: number;
  status: "active" | "paused" | "cancelled";
  tiers: BackendTier[];
  cycles: BackendCycle[];
  currentCycle?: BackendCycle;
  currentPrice: number | null;
};

function tierBandLabel(tiers: BackendTier[], tierNumber: number | null) {
  if (!tierNumber) return null;
  const tier = tiers.find((t) => t.tierNumber === tierNumber);
  return tier ? `${tier.minBuyers}–${tier.maxBuyers}` : null;
}

function cycleHistory(deal: BackendDeal): MerchantCycleHistoryItem[] {
  return [...deal.cycles]
    .sort((a, b) => b.cycleNumber - a.cycleNumber)
    .map((cycle) => {
      const band = tierBandLabel(deal.tiers, cycle.finalTierReached);
      const labelAr = band ? `دورة #${cycle.cycleNumber} • ${band} مشترك` : `دورة #${cycle.cycleNumber}`;
      const labelEn = band
        ? `Cycle #${cycle.cycleNumber} • ${band} buyers`
        : `Cycle #${cycle.cycleNumber}`;
      // Lifecycle transitions (succeeded/held/cancelled) aren't implemented
      // on the backend yet — every real cycle is currently "active" or
      // "failed" in practice, but the table's outcome styling already
      // covers all 3 of the mock's original states, so this maps straight
      // through rather than collapsing anything.
      const outcome: MerchantCycleHistoryItem["outcome"] =
        cycle.status === "succeeded" || cycle.status === "failed" ? cycle.status : "active";
      const price = cycle.finalTierReached
        ? Number(deal.tiers.find((t) => t.tierNumber === cycle.finalTierReached)?.pricePerUnit ?? 0)
        : null;
      const amount = price !== null ? Number((price * cycle.unitsSold).toFixed(2)) : null;

      return { id: cycle.id, label_ar: labelAr, label_en: labelEn, outcome, amount };
    });
}

function toRow(deal: BackendDeal): MerchantDealRow {
  const currentCycle = deal.currentCycle;
  return {
    dealId: deal.id,
    title_ar: deal.titleAr,
    title_en: deal.titleEn,
    remainingStock: deal.remainingStock,
    totalStock: deal.totalStock,
    currentCycleSold: currentCycle?.unitsSold ?? 0,
    currentCycleStock: currentCycle?.stockAllocated ?? deal.totalStock,
    currentTier: currentCycle?.finalTierReached ?? null,
    status:
      deal.status !== "active"
        ? "paused"
        : currentCycle?.status === "held"
          ? "needs_stock"
          : "active",
    history: cycleHistory(deal),
    dealStatus: deal.status,
    cycleHeld: currentCycle?.status === "held",
    hasRunningDeposits: currentCycle?.status === "active" && currentCycle.unitsSold > 0,
  };
}

export type MerchantDealsData = {
  rows: MerchantDealRow[];
  stats: MerchantDashboardStats;
  hasAlert: boolean;
};

const EMPTY: MerchantDealsData = {
  rows: [],
  stats: { totalDeals: 0, unitsSold: 0, revenue: 0 },
  hasAlert: false,
};

/** The logged-in merchant's own deals, for their dashboard. Degrades to an
 * empty dashboard (rather than throwing) on a backend hiccup. */
export async function getMyDeals(): Promise<MerchantDealsData> {
  const token = await getSessionToken();
  if (!token) return EMPTY;

  let backendDeals: BackendDeal[];
  try {
    backendDeals = await backendFetch<BackendDeal[]>("/deals/mine", {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return EMPTY;
  }

  const rows = backendDeals.map(toRow);

  const unitsSold = backendDeals.reduce(
    (sum, deal) => sum + deal.cycles.reduce((s, c) => s + c.unitsSold, 0),
    0,
  );
  // Revenue = what the merchant has actually earned: paid out + payable now
  // (completed orders, net of dispute adjustments) — not price x units sold.
  let revenue = 0;
  try {
    const mine = await backendFetch<{ owed: number; paidOut: number }>("/ledger/mine", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    revenue = mine.owed + mine.paidOut;
  } catch {
    revenue = 0;
  }
  // Flags when a deal's two most-recent cycles both failed — same "repeated
  // consecutive failures" rule as the original spec's merchant alert.
  const hasAlert = rows.some((row) => {
    const recent = row.history.slice(0, 2);
    return recent.length === 2 && recent.every((h) => h.outcome === "failed");
  });

  return {
    rows,
    stats: { totalDeals: rows.length, unitsSold, revenue: Number(revenue.toFixed(2)) },
    hasAlert,
  };
}

/** Merchant adds stock (multiples of 5). A held cycle resumes if it now has enough. */
export async function restockDealAction(
  dealId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return postAction(
    `/deals/${dealId}/restock`,
    { units: Number(formData.get("units")) },
    "/merchant/dashboard",
  );
}

/** Merchant cancels a deal — the backend blocks it while deposits are running. */
export async function cancelDealAction(dealId: string, _prev: ActionState): Promise<ActionState> {
  return postAction(`/deals/${dealId}/cancel`, {}, "/merchant/dashboard");
}

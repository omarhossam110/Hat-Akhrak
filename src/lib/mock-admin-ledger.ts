/**
 * Placeholder data for the Super Admin ledger until real Supabase queries
 * (aggregating orders/payments per merchant) are wired up. Keyed to the
 * same merchants as src/lib/mock-merchants.ts.
 */
export interface MerchantLedgerRow {
  merchantId: string;
  businessName: string;
  completedDeals: number;
  collected: number;
  commission: number;
  owed: number;
}

export const merchantLedger: MerchantLedgerRow[] = [
  {
    merchantId: "m1",
    businessName: "TechZone",
    completedDeals: 34,
    collected: 142000,
    commission: 4970,
    owed: 137030,
  },
  {
    merchantId: "m2",
    businessName: "HomeStyle",
    completedDeals: 19,
    collected: 68500,
    commission: 2397,
    owed: 66103,
  },
  {
    merchantId: "m3",
    businessName: "Kitchen Plus",
    completedDeals: 7,
    collected: 24500,
    commission: 858,
    owed: 23642,
  },
];

/**
 * Shape of a row in the Super Admin settlement ledger. Originally mock data;
 * now populated for real from src/lib/actions/ledger.ts (GET /ledger) — this
 * file stays as the type only.
 */
export interface MerchantLedgerRow {
  merchantId: string;
  businessName: string;
  /** Cycles that closed successfully on this merchant's deals. */
  completedDeals: number;
  /** Net money received from customers (deposits + balances − refunds). */
  collected: number;
  /** The platform's take on fully-paid orders. */
  commission: number;
  /** Merchant share on delivered orders still in the 48h inspection window. */
  held: number;
  /** Already transferred to the merchant. */
  paidOut: number;
  /** Payable right now. */
  owed: number;
}

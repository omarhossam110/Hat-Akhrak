/**
 * Hand-authored types for the data the backend returns. The source of truth
 * for the schema is hat-akhrak-backend/src/database/schema.ts.
 */

export type UserRole = "customer" | "merchant" | "super_admin";
export type DealStatus = "active" | "paused" | "cancelled";
export type CycleStatus = "active" | "succeeded" | "failed" | "held" | "cancelled";
export type OrderStatus =
  | "deposit_paid"
  | "awaiting_balance"
  | "balance_paid"
  | "delivered"
  | "completed"
  | "cancelled_by_buyer"
  | "refused_by_buyer"
  | "disputed"
  | "refunded";
export type PaymentType = "deposit" | "balance" | "refund" | "payout";
export type PaymentStatus = "pending" | "succeeded" | "failed" | "reversed";
export type DisputeStatus = "open" | "investigating" | "resolved_buyer" | "resolved_merchant";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  /** This customer's own shareable invite code (e.g. "OMAR-4821"). */
  referral_code: string;
  /**
   * The referral_code of whoever invited this customer, if any. No reward
   * mechanic is attached yet (e.g. wallet credit) — that's still being
   * designed; this column just tracks who invited whom for now.
   */
  referred_by: string | null;
  created_at: string;
}

export interface Merchant {
  id: string;
  user_id: string;
  business_name: string;
  tax_id: string | null;
  branch_info: string | null;
  is_verified: boolean;
  rating: number;
  member_since: string;
  created_at: string;
}

/** Safe-to-expose subset — no tax_id/branch_info. Matches `merchant_public_profiles`. */
export type MerchantPublicProfile = Pick<
  Merchant,
  "id" | "business_name" | "is_verified" | "rating" | "member_since"
>;

export interface Category {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  is_custom: boolean;
  created_at: string;
}

export interface Deal {
  id: string;
  merchant_id: string;
  category_id: string | null;
  title: string;
  title_ar: string | null;
  title_en: string | null;
  description: string | null;
  images: string[];
  wholesale_unit_price: number;
  total_stock: number;
  remaining_stock: number;
  status: DealStatus;
  created_at: string;
  cancelled_at: string | null;
}

export interface DealTier {
  id: string;
  deal_id: string;
  tier_number: 1 | 2 | 3;
  min_buyers: number;
  max_buyers: number;
  price_per_unit: number;
}

export interface Cycle {
  id: string;
  deal_id: string;
  cycle_number: number;
  status: CycleStatus;
  stock_allocated: number;
  units_sold: number;
  final_tier_reached: 1 | 2 | 3 | null;
  started_at: string;
  ends_at: string;
  freeze_at: string;
  cancel_reason: string | null;
  cancelled_by: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  cycle_id: string;
  customer_id: string;
  units: 1 | 2;
  deposit_amount: number;
  balance_amount: number | null;
  final_unit_price: number | null;
  status: OrderStatus;
  cancel_deadline: string;
  delivered_at: string | null;
  inspection_deadline: string | null;
  delivery_invoice_photo_url: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string | null;
  merchant_id: string | null;
  type: PaymentType;
  amount: number;
  gateway_ref: string | null;
  status: PaymentStatus;
  created_at: string;
}

export interface Dispute {
  id: string;
  order_id: string;
  raised_by: string;
  reason: string;
  status: DisputeStatus;
  resolution_notes: string | null;
  resolved_by: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface MerchantAlert {
  id: string;
  merchant_id: string;
  deal_id: string;
  consecutive_failed_cycles: number;
  message: string;
  acknowledged: boolean;
  created_at: string;
}

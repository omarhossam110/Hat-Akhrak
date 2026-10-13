/**
 * Shared type for merchant public-profile data. Originally backed by mock
 * data; now populated for real from src/lib/actions/public-merchants.ts
 * (GET /merchants, GET /merchants/:id) — this type definition stayed put
 * since the Merchants listing/profile pages both already depend on this
 * exact shape. Matches the `merchant_public_profiles` view (no
 * tax_id/branch_info — those stay private to the merchant + super admin
 * per the spec).
 */
export interface MockMerchantProfile {
  id: string;
  business_name: string;
  is_verified: boolean;
  rating: number;
  review_count: number;
  completed_deals: number;
  member_since: string;
  bio_ar: string;
  bio_en: string;
  avatarVariant: "a" | "b" | "c" | "d";
}

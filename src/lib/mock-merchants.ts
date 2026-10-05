import { mockDeals } from "@/lib/mock-deals";

/**
 * Placeholder merchant-profile data until a real Supabase project is
 * connected. Keyed by the same merchant_id used on `deals.merchant_id`, and
 * matches the `merchant_public_profiles` view's shape (no tax_id/branch_info
 * — those stay private to the merchant + super admin per the spec).
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

export const mockMerchants: MockMerchantProfile[] = [
  {
    id: "m1",
    business_name: "TechZone",
    is_verified: true,
    rating: 4.8,
    review_count: 126,
    completed_deals: 34,
    member_since: "2024",
    bio_ar:
      "متخصصين في الإلكترونيات والإكسسوارات بسعر الجملة من 2019. كل الصفقات والتسويات بتتم من خلال السوبر أدمن لضمان حقوق العميل والمورد.",
    bio_en:
      "Specialized in electronics and accessories at wholesale prices since 2019. All deals and settlements run through the super admin to protect both customers and the merchant.",
    avatarVariant: "a",
  },
  {
    id: "m2",
    business_name: "HomeStyle",
    is_verified: true,
    rating: 4.6,
    review_count: 54,
    completed_deals: 19,
    member_since: "2023",
    bio_ar: "أدوات مطبخ ومنزل عالية الجودة بأسعار الجملة، مباشرة من المصنع.",
    bio_en: "High-quality kitchen and home goods at wholesale prices, direct from the factory.",
    avatarVariant: "b",
  },
  {
    id: "m3",
    business_name: "Kitchen Plus",
    is_verified: false,
    rating: 4.2,
    review_count: 19,
    completed_deals: 7,
    member_since: "2025",
    bio_ar: "أجهزة مطبخ صغيرة وإكسسوارات منزلية بأسعار تنافسية.",
    bio_en: "Small kitchen appliances and home accessories at competitive prices.",
    avatarVariant: "c",
  },
];

export function getMerchantById(id: string) {
  return mockMerchants.find((m) => m.id === id);
}

export function getDealsByMerchant(id: string) {
  return mockDeals.filter((card) => card.deal.merchant_id === id);
}

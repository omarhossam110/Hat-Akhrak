import type { Deal, DealTier, Cycle } from "@/lib/types/database";

/**
 * Placeholder data for the Deals page until a real Supabase project is
 * connected. Shape matches the `deals` / `deal_tiers` / `cycles` tables
 * exactly, so swapping these for real queries later is a drop-in change.
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
   * formula once it's implemented server-side.
   */
  depositAmount: number;
}

const hoursFromNow = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();

export const mockDeals: MockDealCard[] = [
  {
    deal: {
      id: "d1",
      merchant_id: "m1",
      title: "سماعة بلوتوث لاسلكية",
      title_ar: "سماعة بلوتوث لاسلكية",
      title_en: "Wireless Bluetooth Earbuds",
      description: null,
      images: [],
      wholesale_unit_price: 350,
      total_stock: 20,
      remaining_stock: 8,
      status: "active",
      created_at: new Date().toISOString(),
      cancelled_at: null,
    },
    tiers: [
      { id: "t1", deal_id: "d1", tier_number: 1, min_buyers: 5, max_buyers: 9, price_per_unit: 480 },
      { id: "t2", deal_id: "d1", tier_number: 2, min_buyers: 10, max_buyers: 14, price_per_unit: 430 },
      { id: "t3", deal_id: "d1", tier_number: 3, min_buyers: 15, max_buyers: 20, price_per_unit: 390 },
    ],
    cycle: {
      id: "c1",
      deal_id: "d1",
      cycle_number: 3,
      status: "active",
      stock_allocated: 20,
      units_sold: 12,
      final_tier_reached: 2,
      started_at: new Date().toISOString(),
      ends_at: hoursFromNow(50),
      freeze_at: hoursFromNow(26),
      cancel_reason: null,
      cancelled_by: null,
      created_at: new Date().toISOString(),
    },
    merchant: { business_name: "TechZone", is_verified: true, rating: 4.8, review_count: 126 },
    icon: "🎧",
    artVariant: "a",
    depositAmount: 60,
  },
  {
    deal: {
      id: "d2",
      merchant_id: "m2",
      title: "طقم مقالي تيفال",
      title_ar: "طقم مقالي تيفال",
      title_en: "Tefal Non-Stick Cookware Set",
      description: null,
      images: [],
      wholesale_unit_price: 900,
      total_stock: 15,
      remaining_stock: 3,
      status: "active",
      created_at: new Date().toISOString(),
      cancelled_at: null,
    },
    tiers: [
      { id: "t4", deal_id: "d2", tier_number: 1, min_buyers: 5, max_buyers: 9, price_per_unit: 1250 },
      { id: "t5", deal_id: "d2", tier_number: 2, min_buyers: 10, max_buyers: 14, price_per_unit: 1150 },
      { id: "t6", deal_id: "d2", tier_number: 3, min_buyers: 15, max_buyers: 20, price_per_unit: 1050 },
    ],
    cycle: {
      id: "c2",
      deal_id: "d2",
      cycle_number: 1,
      status: "active",
      stock_allocated: 15,
      units_sold: 12,
      final_tier_reached: 3,
      started_at: new Date().toISOString(),
      ends_at: hoursFromNow(18),
      freeze_at: hoursFromNow(-6),
      cancel_reason: null,
      cancelled_by: null,
      created_at: new Date().toISOString(),
    },
    merchant: { business_name: "HomeStyle", is_verified: true, rating: 4.6, review_count: 54 },
    icon: "🍳",
    artVariant: "b",
    depositAmount: 150,
  },
  {
    deal: {
      id: "d3",
      merchant_id: "m3",
      title: "بلياية هاند بليندر",
      title_ar: "خلاط يدوي كهربائي",
      title_en: "Electric Hand Blender",
      description: null,
      images: [],
      wholesale_unit_price: 220,
      total_stock: 20,
      remaining_stock: 20,
      status: "active",
      created_at: new Date().toISOString(),
      cancelled_at: null,
    },
    tiers: [
      { id: "t7", deal_id: "d3", tier_number: 1, min_buyers: 5, max_buyers: 9, price_per_unit: 310 },
      { id: "t8", deal_id: "d3", tier_number: 2, min_buyers: 10, max_buyers: 14, price_per_unit: 280 },
      { id: "t9", deal_id: "d3", tier_number: 3, min_buyers: 15, max_buyers: 20, price_per_unit: 255 },
    ],
    cycle: {
      id: "c3",
      deal_id: "d3",
      cycle_number: 1,
      status: "active",
      stock_allocated: 20,
      units_sold: 3,
      final_tier_reached: null,
      started_at: new Date().toISOString(),
      ends_at: hoursFromNow(71),
      freeze_at: hoursFromNow(47),
      cancel_reason: null,
      cancelled_by: null,
      created_at: new Date().toISOString(),
    },
    merchant: { business_name: "Kitchen Plus", is_verified: false, rating: 4.2, review_count: 19 },
    icon: "🧃",
    artVariant: "c",
    depositAmount: 45,
  },
  {
    deal: {
      id: "d4",
      merchant_id: "m1",
      title: "شاحن سريع 65 وات",
      title_ar: "شاحن سريع 65 وات",
      title_en: "65W Fast Charger",
      description: null,
      images: [],
      wholesale_unit_price: 650,
      total_stock: 20,
      remaining_stock: 18,
      status: "active",
      created_at: new Date().toISOString(),
      cancelled_at: null,
    },
    tiers: [
      { id: "t10", deal_id: "d4", tier_number: 1, min_buyers: 5, max_buyers: 9, price_per_unit: 1250 },
      { id: "t11", deal_id: "d4", tier_number: 2, min_buyers: 10, max_buyers: 14, price_per_unit: 1050 },
      { id: "t12", deal_id: "d4", tier_number: 3, min_buyers: 15, max_buyers: 20, price_per_unit: 890 },
    ],
    cycle: {
      id: "c4",
      deal_id: "d4",
      cycle_number: 1,
      status: "active",
      stock_allocated: 20,
      units_sold: 2,
      final_tier_reached: null,
      started_at: new Date().toISOString(),
      ends_at: hoursFromNow(51),
      freeze_at: hoursFromNow(27),
      cancel_reason: null,
      cancelled_by: null,
      created_at: new Date().toISOString(),
    },
    merchant: { business_name: "TechZone", is_verified: true, rating: 4.8, review_count: 126 },
    icon: "⚡",
    artVariant: "d",
    depositAmount: 110,
  },
];

export function getDealById(id: string): MockDealCard | undefined {
  return mockDeals.find((card) => card.deal.id === id);
}

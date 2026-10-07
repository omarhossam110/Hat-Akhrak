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
// Negative offsets = in the past — staggered so "newest/oldest" sorting has
// something real to demonstrate instead of every deal sharing one timestamp.
const hoursAgo = (h: number) => hoursFromNow(-h);

export const mockDeals: MockDealCard[] = [
  {
    deal: {
      id: "d1",
      merchant_id: "m1",
      category_id: "cat-mobiles",
      title: "سماعة بلوتوث لاسلكية",
      title_ar: "سماعة بلوتوث لاسلكية",
      title_en: "Wireless Bluetooth Earbuds",
      description: null,
      images: [],
      wholesale_unit_price: 350,
      total_stock: 20,
      remaining_stock: 8,
      status: "active",
      created_at: hoursAgo(3),
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
      started_at: hoursAgo(3),
      ends_at: hoursFromNow(50),
      freeze_at: hoursFromNow(26),
      cancel_reason: null,
      cancelled_by: null,
      created_at: hoursAgo(3),
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
      category_id: "cat-home-kitchen",
      title: "طقم مقالي تيفال",
      title_ar: "طقم مقالي تيفال",
      title_en: "Tefal Non-Stick Cookware Set",
      description: null,
      images: [],
      wholesale_unit_price: 900,
      total_stock: 15,
      remaining_stock: 3,
      status: "active",
      created_at: hoursAgo(50),
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
      started_at: hoursAgo(50),
      ends_at: hoursFromNow(18),
      freeze_at: hoursFromNow(-6),
      cancel_reason: null,
      cancelled_by: null,
      created_at: hoursAgo(50),
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
      category_id: "cat-home-kitchen",
      title: "بلياية هاند بليندر",
      title_ar: "خلاط يدوي كهربائي",
      title_en: "Electric Hand Blender",
      description: null,
      images: [],
      wholesale_unit_price: 220,
      total_stock: 20,
      remaining_stock: 20,
      status: "active",
      created_at: hoursAgo(10),
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
      started_at: hoursAgo(10),
      ends_at: hoursFromNow(71),
      freeze_at: hoursFromNow(47),
      cancel_reason: null,
      cancelled_by: null,
      created_at: hoursAgo(10),
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
      category_id: "cat-mobiles",
      title: "شاحن سريع 65 وات",
      title_ar: "شاحن سريع 65 وات",
      title_en: "65W Fast Charger",
      description: null,
      images: [],
      wholesale_unit_price: 650,
      total_stock: 20,
      remaining_stock: 18,
      status: "active",
      created_at: hoursAgo(120),
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
      started_at: hoursAgo(120),
      ends_at: hoursFromNow(51),
      freeze_at: hoursFromNow(27),
      cancel_reason: null,
      cancelled_by: null,
      created_at: hoursAgo(120),
    },
    merchant: { business_name: "TechZone", is_verified: true, rating: 4.8, review_count: 126 },
    icon: "⚡",
    artVariant: "d",
    depositAmount: 110,
  },
  {
    deal: {
      id: "d5",
      merchant_id: "m2",
      category_id: "cat-fashion",
      title: "حذاء رياضي رجالي",
      title_ar: "حذاء رياضي رجالي",
      title_en: "Men's Running Shoes",
      description: null,
      images: [],
      wholesale_unit_price: 420,
      total_stock: 20,
      remaining_stock: 2,
      status: "active",
      created_at: hoursAgo(1),
      cancelled_at: null,
    },
    tiers: [
      { id: "t13", deal_id: "d5", tier_number: 1, min_buyers: 5, max_buyers: 9, price_per_unit: 580 },
      { id: "t14", deal_id: "d5", tier_number: 2, min_buyers: 10, max_buyers: 14, price_per_unit: 520 },
      { id: "t15", deal_id: "d5", tier_number: 3, min_buyers: 15, max_buyers: 20, price_per_unit: 470 },
    ],
    cycle: {
      id: "c5",
      deal_id: "d5",
      cycle_number: 2,
      status: "active",
      stock_allocated: 20,
      units_sold: 18,
      final_tier_reached: 3,
      started_at: hoursAgo(1),
      ends_at: hoursFromNow(9),
      freeze_at: hoursFromNow(-15),
      cancel_reason: null,
      cancelled_by: null,
      created_at: hoursAgo(1),
    },
    merchant: { business_name: "HomeStyle", is_verified: true, rating: 4.6, review_count: 54 },
    icon: "👟",
    artVariant: "a",
    depositAmount: 80,
  },
  {
    deal: {
      id: "d6",
      merchant_id: "m3",
      category_id: "cat-toys-kids",
      title: "مكعبات بناء للأطفال",
      title_ar: "مكعبات بناء للأطفال",
      title_en: "Kids Building Blocks Set",
      description: null,
      images: [],
      wholesale_unit_price: 180,
      total_stock: 20,
      remaining_stock: 11,
      status: "active",
      created_at: hoursAgo(30),
      cancelled_at: null,
    },
    tiers: [
      { id: "t16", deal_id: "d6", tier_number: 1, min_buyers: 5, max_buyers: 9, price_per_unit: 260 },
      { id: "t17", deal_id: "d6", tier_number: 2, min_buyers: 10, max_buyers: 14, price_per_unit: 230 },
      { id: "t18", deal_id: "d6", tier_number: 3, min_buyers: 15, max_buyers: 20, price_per_unit: 210 },
    ],
    cycle: {
      id: "c6",
      deal_id: "d6",
      cycle_number: 1,
      status: "active",
      stock_allocated: 20,
      units_sold: 6,
      final_tier_reached: 1,
      started_at: hoursAgo(30),
      ends_at: hoursFromNow(40),
      freeze_at: hoursFromNow(16),
      cancel_reason: null,
      cancelled_by: null,
      created_at: hoursAgo(30),
    },
    merchant: { business_name: "Kitchen Plus", is_verified: false, rating: 4.2, review_count: 19 },
    icon: "🧸",
    artVariant: "c",
    depositAmount: 35,
  },
];

export function getDealById(id: string): MockDealCard | undefined {
  return mockDeals.find((card) => card.deal.id === id);
}

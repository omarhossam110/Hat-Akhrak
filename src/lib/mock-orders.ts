import type { OrderStatus } from "@/lib/types/database";

/**
 * Placeholder data for the My Orders page until real auth + Supabase
 * queries are wired up (orders scoped to the signed-in customer_id).
 */
export interface MockOrder {
  id: string;
  productTitle_ar: string;
  productTitle_en: string;
  status: OrderStatus;
  amount: number;
}

export const mockOrders: MockOrder[] = [
  {
    id: "o1",
    productTitle_ar: "سماعة بلوتوث لاسلكية",
    productTitle_en: "Wireless Bluetooth Earbuds",
    status: "deposit_paid",
    amount: 60,
  },
  {
    id: "o2",
    productTitle_ar: "طقم مقالي تيفال",
    productTitle_en: "Tefal Non-Stick Cookware Set",
    status: "completed",
    amount: 680,
  },
  {
    id: "o3",
    productTitle_ar: "شاحن سريع 65 وات",
    productTitle_en: "65W Fast Charger",
    status: "refunded",
    amount: 45,
  },
];

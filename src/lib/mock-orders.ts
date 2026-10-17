import type { OrderStatus } from "@/lib/types/database";

/**
 * Shape of a row on the My Orders page. Originally backed by mock data; now
 * populated for real from src/lib/actions/orders.ts (GET /orders/mine) —
 * this type stayed put since the page already renders exactly this shape.
 */
export interface MockOrder {
  id: string;
  productTitle_ar: string;
  productTitle_en: string;
  status: OrderStatus;
  amount: number;
  /** Still owed after the cycle closed (only while awaiting the balance). */
  balanceDue?: number;
  /** The deposit can still be cancelled right now (24h window, not frozen). */
  canCancel?: boolean;
  /** A problem can be reported right now (awaiting balance or inside the inspection window). */
  canReport?: boolean;
}

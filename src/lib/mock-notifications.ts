import { mockDeals } from "@/lib/mock-deals";
import { mockOrders } from "@/lib/mock-orders";

/**
 * Derived, not stored: notifications are computed from the same mock
 * deals/orders data rather than a separate hand-authored list, so they
 * stay consistent with whatever the Deals/Orders pages already show.
 * Once real Supabase tables exist, this becomes a `notifications` table
 * populated by DB triggers (cycle ending soon, order status change).
 */
export type NotificationKind = "ending_soon" | "order_status";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  titleKey: string;
  params: Record<string, string | number>;
  href: string;
  createdAt: string;
}

const ENDING_SOON_HOURS = 24;

export function buildNotifications(): AppNotification[] {
  const notifications: AppNotification[] = [];

  for (const card of mockDeals) {
    const hoursLeft = (new Date(card.cycle.ends_at).getTime() - Date.now()) / 3_600_000;
    if (hoursLeft > 0 && hoursLeft <= ENDING_SOON_HOURS) {
      notifications.push({
        id: `ending-${card.deal.id}`,
        kind: "ending_soon",
        titleKey: "notifications.endingSoon",
        params: { title: card.deal.title_ar ?? card.deal.title },
        href: `/deals/${card.deal.id}`,
        createdAt: new Date(Date.now() - 20 * 60_000).toISOString(),
      });
    }
  }

  const ORDER_STATUS_LABEL_KEY: Record<string, string> = {
    balance_paid: "notifications.orderBalancePaid",
    delivered: "notifications.orderDelivered",
    completed: "notifications.orderCompleted",
    refunded: "notifications.orderRefunded",
  };

  for (const order of mockOrders) {
    const key = ORDER_STATUS_LABEL_KEY[order.status];
    if (!key) continue;
    notifications.push({
      id: `order-${order.id}`,
      kind: "order_status",
      titleKey: key,
      params: { title: order.productTitle_ar },
      href: "/orders",
      createdAt: new Date(Date.now() - 3 * 3_600_000).toISOString(),
    });
  }

  return notifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

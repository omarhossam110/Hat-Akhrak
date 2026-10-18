"use server";

import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { BackendError, backendFetch } from "@/lib/backend/client";
import { getSessionToken } from "@/lib/auth/session";
import type { MockOrder } from "@/lib/mock-orders";
import type { OrderStatus } from "@/lib/types/database";

export type PayDepositState =
  | { error: "notSignedIn" | "rejected" | "generic"; code?: string }
  | undefined;

/**
 * "Pay now" on the payment page. There's no real payment gateway yet (the
 * provider is still TBD), so this is the placeholder the spec's owner
 * approved: the backend records the order as deposit_paid straight away.
 * The deposit amount is NOT sent — the backend computes it itself from the
 * deal's wholesale price + category, so a client can't pick its own.
 */
export async function payDepositAction(
  _prev: PayDepositState,
  formData: FormData,
): Promise<PayDepositState> {
  const cycleId = String(formData.get("cycleId") ?? "");
  const units = Number(formData.get("units")) || 1;
  const field = (name: string) => String(formData.get(name) ?? "").trim();

  const token = await getSessionToken();
  if (!token) return { error: "notSignedIn" };

  try {
    await backendFetch("/orders", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        cycleId,
        units,
        deliveryName: field("deliveryName"),
        deliveryPhone: field("deliveryPhone"),
        deliveryGovernorate: field("deliveryGovernorate"),
        deliveryCity: field("deliveryCity"),
        deliveryAddress: field("deliveryAddress"),
      }),
    });
  } catch (err) {
    if (err instanceof BackendError) {
      if (err.status === 401) return { error: "notSignedIn" };
      // 400/404: a business rule said no (frozen cycle, over the 2-unit cap,
      // out of stock, cycle closed) — the stable `code` says which, so the
      // UI can show it translated.
      if (err.status === 400 || err.status === 404 || err.status === 403) {
        return { error: "rejected", code: err.code };
      }
    }
    return { error: "generic" };
  }

  const locale = await getLocale();
  redirect(`/${locale}/orders`);
}

export type DeliveryDetails = {
  name: string;
  phone: string;
  governorate: string;
  city: string;
  address: string;
};

type BackendOrder = {
  id: string;
  deliveryName?: string | null;
  deliveryPhone?: string | null;
  deliveryGovernorate?: string | null;
  deliveryCity?: string | null;
  deliveryAddress?: string | null;
  units: number;
  depositAmount: string;
  balanceAmount: string | null;
  status: OrderStatus;
  createdAt: string;
  cancelDeadline: string;
  inspectionDeadline: string | null;
  deliveryInvoicePhotoUrl?: string | null;
  cycle: {
    freezeAt: string;
    deal: { id: string; title: string; titleAr: string | null; titleEn: string | null };
  };
};

// Statuses from which the balance has actually been paid. Before that,
// `balanceAmount` is only what the customer still OWES (set when the cycle
// succeeds), so it must not be counted as paid.
const BALANCE_PAID: OrderStatus[] = ["balance_paid", "delivered", "completed"];

/** The signed-in customer's real orders (GET /orders/mine), mapped onto the
 * MockOrder shape the My Orders page already renders. `amount` is what the
 * customer has actually paid so far: the deposit, plus the balance only once
 * it's been paid. */
export async function getMyOrders(): Promise<MockOrder[]> {
  const token = await getSessionToken();
  if (!token) return [];

  try {
    const rows = await backendFetch<BackendOrder[]>("/orders/mine", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return rows.map((row) => ({
      id: row.id,
      productTitle_ar: row.cycle.deal.titleAr ?? row.cycle.deal.title,
      productTitle_en: row.cycle.deal.titleEn ?? row.cycle.deal.title,
      status: row.status,
      invoiceUrl: /^https?:\/\//i.test(row.deliveryInvoicePhotoUrl ?? "")
        ? (row.deliveryInvoicePhotoUrl ?? undefined)
        : undefined,
      // Cancelling is open only while both the order's own 24h window and the
      // cycle's final-24h freeze allow it (the backend re-checks on submit).
      canCancel:
        row.status === "deposit_paid" &&
        Date.now() < Math.min(Date.parse(row.cancelDeadline), Date.parse(row.cycle.freezeAt)),
      // A problem can be reported before paying the rest, or while the 48h
      // inspection window after delivery is still open.
      canReport:
        row.status === "awaiting_balance" ||
        (row.status === "delivered" &&
          !!row.inspectionDeadline &&
          Date.now() <= Date.parse(row.inspectionDeadline)),
      // What's still owed once the cycle has closed — drives "pay the rest".
      balanceDue:
        row.status === "awaiting_balance" ? Number(row.balanceAmount ?? 0) : undefined,
      amount: Number(
        (
          Number(row.depositAmount) +
          (BALANCE_PAID.includes(row.status) ? Number(row.balanceAmount ?? 0) : 0)
        ).toFixed(2),
      ),
    }));
  } catch {
    return [];
  }
}

/** The delivery details from the customer's most recent order, to prefill the
 * next one. Null for a first-time buyer. */
export async function getLastDelivery(): Promise<DeliveryDetails | null> {
  const token = await getSessionToken();
  if (!token) return null;
  try {
    const rows = await backendFetch<BackendOrder[]>("/orders/mine", {
      headers: { Authorization: `Bearer ${token}` },
    });
    // /orders/mine is newest-first.
    const last = rows.find((r) => r.deliveryName && r.deliveryPhone);
    if (!last) return null;
    return {
      name: last.deliveryName ?? "",
      phone: last.deliveryPhone ?? "",
      governorate: last.deliveryGovernorate ?? "",
      city: last.deliveryCity ?? "",
      address: last.deliveryAddress ?? "",
    };
  } catch {
    return null;
  }
}

export type OrderActionState =
  | { error: "notSignedIn" | "rejected" | "generic"; code?: string }
  | undefined;

async function orderAction(
  path: string,
  body: Record<string, unknown>,
  redirectTo: string,
): Promise<OrderActionState> {
  const token = await getSessionToken();
  if (!token) return { error: "notSignedIn" };

  try {
    await backendFetch(path, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  } catch (err) {
    if (err instanceof BackendError) {
      if (err.status === 401) return { error: "notSignedIn" };
      if (err.status === 400 || err.status === 404) {
        return { error: "rejected", code: err.code };
      }
    }
    return { error: "generic" };
  }

  // Redirecting to the page we came from re-renders it with fresh data.
  const locale = await getLocale();
  redirect(`/${locale}${redirectTo}`);
}

/** Customer cancels a deposit-stage order (inside the window) for a full refund. */
export async function cancelOrderAction(
  orderId: string,
  _prev: OrderActionState,
): Promise<OrderActionState> {
  return orderAction(`/orders/${orderId}/cancel`, {}, "/orders");
}

/** Customer pays the remaining balance once the cycle has closed. Placeholder
 * payment (no gateway yet) — the backend records it straight away. */
export async function payBalanceAction(
  orderId: string,
  _prev: OrderActionState,
): Promise<OrderActionState> {
  return orderAction(`/orders/${orderId}/pay-balance`, {}, "/orders");
}

/** Merchant marks an order delivered (starts the customer's 48h inspection
 * window). Needs the balance to have been paid first — the backend enforces it. */
export async function deliverOrderAction(
  orderId: string,
  _prev: OrderActionState,
): Promise<OrderActionState> {
  return orderAction(`/orders/${orderId}/deliver`, {}, "/merchant/dashboard");
}

export type MerchantOrderRow = {
  id: string;
  dealTitle_ar: string;
  dealTitle_en: string;
  customerName: string;
  units: number;
  status: OrderStatus;
  /** Only present once the order is shippable (cycle closed). */
  delivery: DeliveryDetails | null;
};

type BackendMerchantOrder = {
  deliveryName: string | null;
  deliveryPhone: string | null;
  deliveryGovernorate: string | null;
  deliveryCity: string | null;
  deliveryAddress: string | null;
  id: string;
  units: number;
  status: OrderStatus;
  dealTitle: string;
  dealTitleAr: string | null;
  dealTitleEn: string | null;
  customerName: string;
};

// Only orders whose cycle has closed matter for fulfilment; ones still
// "deposit_paid" are in a running cycle and refunded ones never ship.
const FULFILMENT_STATUSES: OrderStatus[] = [
  "awaiting_balance",
  "balance_paid",
  "delivered",
  "completed",
  "disputed",
  "refused_by_buyer",
];

/** Orders on the signed-in merchant's own deals that are past the cycle
 * stage (GET /orders/merchant), for the dashboard's fulfilment table. */
export async function getMerchantOrders(): Promise<MerchantOrderRow[]> {
  const token = await getSessionToken();
  if (!token) return [];

  try {
    const rows = await backendFetch<BackendMerchantOrder[]>("/orders/merchant", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return rows
      .filter((r) => FULFILMENT_STATUSES.includes(r.status))
      .map((r) => ({
        id: r.id,
        dealTitle_ar: r.dealTitleAr ?? r.dealTitle,
        dealTitle_en: r.dealTitleEn ?? r.dealTitle,
        customerName: r.customerName,
        units: r.units,
        status: r.status,
        delivery:
          r.deliveryName && r.deliveryPhone
            ? {
                name: r.deliveryName,
                phone: r.deliveryPhone,
                governorate: r.deliveryGovernorate ?? "",
                city: r.deliveryCity ?? "",
                address: r.deliveryAddress ?? "",
              }
            : null,
      }));
  } catch {
    return [];
  }
}

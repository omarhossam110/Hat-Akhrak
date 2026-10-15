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

  const token = await getSessionToken();
  if (!token) return { error: "notSignedIn" };

  try {
    await backendFetch("/orders", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ cycleId, units }),
    });
  } catch (err) {
    if (err instanceof BackendError) {
      if (err.status === 401) return { error: "notSignedIn" };
      // 400/404: a business rule said no (frozen cycle, over the 2-unit cap,
      // out of stock, cycle closed) — the stable `code` says which, so the
      // UI can show it translated.
      if (err.status === 400 || err.status === 404) {
        return { error: "rejected", code: err.code };
      }
    }
    return { error: "generic" };
  }

  const locale = await getLocale();
  redirect(`/${locale}/orders`);
}

type BackendOrder = {
  id: string;
  units: number;
  depositAmount: string;
  balanceAmount: string | null;
  status: OrderStatus;
  createdAt: string;
  cycle: {
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

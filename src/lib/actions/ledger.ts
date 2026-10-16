"use server";

import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { BackendError, backendFetch } from "@/lib/backend/client";
import { getSessionToken } from "@/lib/auth/session";
import type { MerchantLedgerRow } from "@/lib/mock-admin-ledger";

export type PayoutState =
  | { error: "notSignedIn" | "rejected" | "generic"; code?: string }
  | undefined;

/** Super admin: per-merchant settlement figures, from real orders/payments. */
export async function getLedger(): Promise<MerchantLedgerRow[]> {
  const token = await getSessionToken();
  if (!token) return [];
  try {
    return await backendFetch<MerchantLedgerRow[]>("/ledger", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return [];
  }
}

/** Super admin records a manual bank transfer to a merchant. */
export async function recordPayoutAction(
  merchantId: string,
  _prev: PayoutState,
  formData: FormData,
): Promise<PayoutState> {
  const token = await getSessionToken();
  if (!token) return { error: "notSignedIn" };

  const amount = Number(formData.get("amount"));
  const reference = String(formData.get("reference") ?? "").trim();
  if (!Number.isFinite(amount) || amount <= 0 || reference.length < 3) {
    return { error: "rejected", code: "invalid" };
  }

  try {
    await backendFetch("/ledger/payouts", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ merchantId, amount, reference }),
    });
  } catch (err) {
    if (err instanceof BackendError) {
      if (err.status === 401) return { error: "notSignedIn" };
      if (err.status === 400 || err.status === 404) {
        return { error: "rejected", code: err.code ?? "invalid" };
      }
    }
    return { error: "generic" };
  }

  const locale = await getLocale();
  redirect(`/${locale}/super-admin`);
}

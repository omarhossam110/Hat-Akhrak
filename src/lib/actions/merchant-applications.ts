"use server";

import { revalidatePath } from "next/cache";
import { BackendError, backendFetch } from "@/lib/backend/client";
import { getSessionToken } from "@/lib/auth/session";

// Wired to the real backend (GET /merchants/pending, PATCH /merchants/:id/
// verify|reject) — the old in-memory mock application list is gone. Real
// merchant signups (src/lib/actions/auth.ts's merchantSignupAction) create
// an actual login-capable account right away, so "approving" here just
// flips is_verified on that existing account rather than creating anything.

export type PendingMerchant = {
  id: string;
  businessName: string;
  taxId: string | null;
  ownerName: string;
  email: string;
  phone: string | null;
  memberSince: string;
  status: "pending" | "rejected";
};

/** Super Admin's review queue. Returns an empty list (rather than throwing)
 * if the backend call fails, so a transient error doesn't take down the
 * whole dashboard — the page can still render everything else. */
export async function getPendingMerchants(): Promise<{
  merchants: PendingMerchant[];
  error?: string;
}> {
  const token = await getSessionToken();
  if (!token) return { merchants: [], error: "errorGeneric" };

  try {
    const merchants = await backendFetch<PendingMerchant[]>("/merchants/pending", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { merchants };
  } catch {
    return { merchants: [], error: "errorGeneric" };
  }
}

/** Super Admin approves a pending (or previously-rejected) application:
 * flips is_verified on the merchant's existing account. */
export async function approveMerchantApplicationAction(formData: FormData) {
  const id = String(formData.get("application_id") ?? "");
  if (!id) return;

  const token = await getSessionToken();
  if (!token) return;

  try {
    await backendFetch(`/merchants/${id}/verify`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // Stale UI state (already verified, deleted, etc.) — the revalidate
    // below will refresh the list to whatever's actually true server-side.
  }

  revalidatePath("/[locale]/super-admin", "page");
  revalidatePath("/[locale]/merchants", "page");
}

/** Super Admin rejects a pending application — it stays visible as
 * "rejected", not deleted (the account itself still exists). */
export async function rejectMerchantApplicationAction(formData: FormData) {
  const id = String(formData.get("application_id") ?? "");
  if (!id) return;

  const token = await getSessionToken();
  if (!token) return;

  try {
    await backendFetch(`/merchants/${id}/reject`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    if (!(err instanceof BackendError)) throw err;
    // Stale UI state (already rejected/verified) — swallow and let the
    // revalidate below reflect reality.
  }

  revalidatePath("/[locale]/super-admin", "page");
}

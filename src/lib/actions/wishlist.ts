"use server";

import { backendFetch } from "@/lib/backend/client";
import { getSessionToken } from "@/lib/auth/session";

async function authed(path: string, init: RequestInit = {}) {
  const token = await getSessionToken();
  if (!token) return null;
  return backendFetch<{ dealIds?: string[] }>(path, {
    ...init,
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** Saved deal ids for the signed-in customer; null = no account list (guest/merchant/admin). */
export async function getWishlistIds(): Promise<string[] | null> {
  try {
    const res = await authed("/wishlist");
    return res?.dealIds ?? null;
  } catch {
    return null;
  }
}

export async function setWishlistAction(dealId: string, saved: boolean): Promise<boolean> {
  try {
    const res = await authed(`/wishlist/${encodeURIComponent(dealId)}`, {
      method: saved ? "PUT" : "DELETE",
    });
    return res !== null;
  } catch {
    return false;
  }
}

/** Folds the guest's browser-local list into the account after signing in. */
export async function mergeWishlistAction(dealIds: string[]): Promise<string[] | null> {
  try {
    if (dealIds.length > 0) {
      await authed("/wishlist/merge", { method: "POST", body: JSON.stringify({ dealIds }) });
    }
    return await getWishlistIds();
  } catch {
    return null;
  }
}

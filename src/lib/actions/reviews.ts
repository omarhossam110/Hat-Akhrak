"use server";

import { BackendError, backendFetch } from "@/lib/backend/client";
import { getSessionToken } from "@/lib/auth/session";
import { postAction, type ActionState } from "@/lib/backend/post-action";

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  /** "First L." — the backend never sends a full name or email. */
  customerName: string;
}

export interface DealReviews {
  average: number;
  count: number;
  items: Review[];
}

export async function getDealReviews(dealId: string): Promise<DealReviews> {
  try {
    return await backendFetch<DealReviews>(`/reviews/deal/${encodeURIComponent(dealId)}`);
  } catch {
    return { average: 0, count: 0, items: [] };
  }
}

/** The signed-in customer's completed, not-yet-reviewed order on this deal, if any. */
export async function getReviewableOrderId(dealId: string): Promise<string | null> {
  const token = await getSessionToken();
  if (!token) return null;
  try {
    const res = await backendFetch<{ orderId: string | null }>(
      `/reviews/deal/${encodeURIComponent(dealId)}/mine`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return res.orderId;
  } catch (err) {
    if (err instanceof BackendError) return null;
    return null;
  }
}

export async function submitReviewAction(
  dealId: string,
  orderId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const rating = Number(formData.get("rating") ?? 0);
  const comment = String(formData.get("comment") ?? "").trim();
  return postAction("/reviews", { orderId, rating, comment }, `/deals/${dealId}`);
}

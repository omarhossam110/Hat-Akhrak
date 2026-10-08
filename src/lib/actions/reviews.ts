"use server";

import { revalidatePath } from "next/cache";
import { addReview } from "@/lib/mock-reviews";

/**
 * Submits a review for a deal. Placeholder until real Supabase auth is
 * wired up (the customer name will come from the signed-in profile instead
 * of a free-text field) — for now it just appends to the in-memory list.
 */
export async function submitReviewAction(formData: FormData) {
  const dealId = String(formData.get("deal_id") ?? "");
  const customerName = String(formData.get("customer_name") ?? "").trim();
  const ratingRaw = Number(formData.get("rating") ?? 0);
  const comment = String(formData.get("comment") ?? "").trim();

  if (!dealId || !customerName || !comment) return;
  if (ratingRaw < 1 || ratingRaw > 5) return;
  const rating = ratingRaw as 1 | 2 | 3 | 4 | 5;

  addReview({ dealId, customerName, rating, comment });

  revalidatePath("/[locale]/deals/[id]", "page");
}

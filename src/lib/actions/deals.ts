"use server";

import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { BackendError, backendFetch } from "@/lib/backend/client";
import { getSessionToken } from "@/lib/auth/session";
import { MAX_DEAL_IMAGES, filesFrom, uploadImage } from "@/lib/backend/upload";

export type AddDealFormState = { error?: "notVerified" | "emailNotVerified" | "validation" | "invalidImage" | "imageTooLarge" | "generic" } | undefined;

/** Merchant publishes a new deal. Only the title, wholesale price,
 * stock count, and an optional category come from the form — the backend
 * computes the 3 tier prices and creates cycle #1 automatically (see
 * hat-akhrak-backend's src/modules/deals/pricing.ts). */
export async function createDealAction(
  _prevState: AddDealFormState,
  formData: FormData,
): Promise<AddDealFormState> {
  const title = String(formData.get("title") ?? "").trim();
  const wholesaleUnitPrice = Number(formData.get("wholesaleUnitPrice"));
  const totalStock = Number(formData.get("totalStock"));
  const categoryId = String(formData.get("categoryId") ?? "").trim();

  if (!title || !wholesaleUnitPrice || !totalStock) {
    return { error: "validation" };
  }

  const token = await getSessionToken();
  if (!token) {
    return { error: "generic" };
  }

  // Photos first: each is stored by the backend and referenced by its path.
  const files = filesFrom(formData, "images");
  if (files.length > MAX_DEAL_IMAGES) return { error: "validation" };
  const images: string[] = [];
  for (const file of files) {
    const up = await uploadImage(file, "deal", token);
    if ("error" in up) return { error: up.error };
    images.push(up.url);
  }

  try {
    await backendFetch("/deals", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title,
        wholesaleUnitPrice,
        totalStock,
        categoryId: categoryId || undefined,
        ...(images.length ? { images } : {}),
      }),
    });
  } catch (err) {
    if (err instanceof BackendError) {
      if (err.status === 403) {
        return { error: err.code === "email_not_verified" ? "emailNotVerified" : "notVerified" };
      }
      if (err.status === 400) return { error: "validation" };
    }
    return { error: "generic" };
  }

  // The merchant dashboard itself is still mock (doesn't list the
  // merchant's real deals yet), but the public Deals/deal-detail pages
  // read from mockDeals, not this backend — this real deal has no page to
  // land on there yet, so redirect to the dashboard same as before,
  // rather than a /deals/:id that would 404.
  const locale = await getLocale();
  redirect(`/${locale}/merchant/dashboard?dealCreated=1`);
}

"use server";

import { revalidatePath } from "next/cache";
import { BackendError, backendFetch } from "@/lib/backend/client";
import { getSessionToken } from "@/lib/auth/session";
import type { Category } from "@/lib/types/database";

// Wired to the real backend (GET /categories is public, POST /categories is
// super_admin-only) — the old in-memory mock list is gone. Backend rows are
// camelCase (Drizzle's convention); this app's `Category` type is the
// snake_case shape the rest of the UI already expects (matches the
// Supabase-style schema these components were originally built against),
// so every row is mapped on the way in.

type BackendCategory = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  isCustom: boolean;
  createdAt: string;
};

function toCategory(row: BackendCategory): Category {
  return {
    id: row.id,
    slug: row.slug,
    name_ar: row.nameAr,
    name_en: row.nameEn,
    is_custom: row.isCustom,
    created_at: row.createdAt,
  };
}

/** Public category list (no auth) — used by the deals filter, merchant
 * deal-creation form, and the Super Admin category panel. Degrades to an
 * empty list (rather than throwing) on a backend hiccup. */
export async function getCategories(): Promise<Category[]> {
  try {
    const rows = await backendFetch<BackendCategory[]>("/categories");
    return rows.map(toCategory);
  } catch {
    return [];
  }
}

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `category-${Date.now()}`
  );
}

/** Super Admin adds a category manually. The backend requires an explicit
 * slug (it's the uniqueness key) — derived here from the English name,
 * same as the old mock helper did. */
export async function addCategoryAction(formData: FormData) {
  const nameAr = String(formData.get("name_ar") ?? "").trim();
  const nameEn = String(formData.get("name_en") ?? "").trim();
  if (!nameAr || !nameEn) return;

  const token = await getSessionToken();
  if (!token) return;

  try {
    await backendFetch("/categories", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ slug: slugify(nameEn), nameAr, nameEn }),
    });
  } catch (err) {
    // A duplicate slug (409) is the only expected failure here — there's
    // no error-display wiring on this form yet, so it just no-ops rather
    // than throwing, same as the old mock version's robustness level.
    if (!(err instanceof BackendError)) throw err;
  }

  revalidatePath("/[locale]/super-admin", "page");
  revalidatePath("/[locale]/deals", "page");
  revalidatePath("/[locale]/merchant/deals/new", "page");
}

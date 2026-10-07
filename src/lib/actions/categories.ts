"use server";

import { revalidatePath } from "next/cache";
import { addCategory } from "@/lib/mock-categories";

/**
 * Super Admin action to add a new category manually. Placeholder until a
 * real Supabase `categories` table + super_admin-only RLS check is wired
 * up (the insert policy already exists in the migration) — for now this
 * just appends to the in-memory mock list and revalidates the pages that
 * read it.
 */
export async function addCategoryAction(formData: FormData) {
  const nameAr = String(formData.get("name_ar") ?? "").trim();
  const nameEn = String(formData.get("name_en") ?? "").trim();

  if (!nameAr || !nameEn) return;

  addCategory(nameAr, nameEn);

  revalidatePath("/[locale]/super-admin", "page");
  revalidatePath("/[locale]/deals", "page");
  revalidatePath("/[locale]/merchant/deals/new", "page");
}

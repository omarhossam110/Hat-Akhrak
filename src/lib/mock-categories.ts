import type { Category } from "@/lib/types/database";

/**
 * Placeholder categories until a real Supabase `categories` table is
 * connected (see supabase/migrations/0001_init.sql). Seeded with an
 * Amazon/Noon-style base set; the Super Admin page can append further
 * categories at runtime via `addCategory` below.
 *
 * This is a module-level in-memory store, not a database: it persists
 * for as long as this server process stays running (good enough for a
 * prototype) but resets on redeploy/restart and isn't shared across
 * separate server instances. Swap for a real table + query once
 * Supabase is connected.
 */
export const mockCategories: Category[] = [
  { id: "cat-electronics", slug: "electronics", name_ar: "إلكترونيات", name_en: "Electronics", is_custom: false, created_at: new Date().toISOString() },
  { id: "cat-mobiles", slug: "mobiles-accessories", name_ar: "موبايلات واكسسوارات", name_en: "Mobiles & Accessories", is_custom: false, created_at: new Date().toISOString() },
  { id: "cat-fashion", slug: "fashion", name_ar: "أزياء", name_en: "Fashion", is_custom: false, created_at: new Date().toISOString() },
  { id: "cat-home-kitchen", slug: "home-kitchen", name_ar: "المنزل والمطبخ", name_en: "Home & Kitchen", is_custom: false, created_at: new Date().toISOString() },
  { id: "cat-beauty", slug: "beauty-personal-care", name_ar: "الجمال والعناية الشخصية", name_en: "Beauty & Personal Care", is_custom: false, created_at: new Date().toISOString() },
  { id: "cat-groceries", slug: "groceries", name_ar: "سوبر ماركت", name_en: "Groceries", is_custom: false, created_at: new Date().toISOString() },
  { id: "cat-toys-kids", slug: "toys-kids", name_ar: "ألعاب ومستلزمات أطفال", name_en: "Toys & Kids", is_custom: false, created_at: new Date().toISOString() },
  { id: "cat-sports", slug: "sports-outdoors", name_ar: "رياضة وأدوات خارجية", name_en: "Sports & Outdoors", is_custom: false, created_at: new Date().toISOString() },
  { id: "cat-books", slug: "books-stationery", name_ar: "كتب وقرطاسية", name_en: "Books & Stationery", is_custom: false, created_at: new Date().toISOString() },
  { id: "cat-watches", slug: "watches-accessories", name_ar: "إكسسوارات وساعات", name_en: "Accessories & Watches", is_custom: false, created_at: new Date().toISOString() },
];

export function getCategoryById(id: string | null): Category | undefined {
  if (!id) return undefined;
  return mockCategories.find((c) => c.id === id);
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-+|-+$/g, "") || `category-${Date.now()}`;
}

/** Appends a super-admin-added category to the in-memory list (see note above). */
export function addCategory(nameAr: string, nameEn: string): Category {
  const category: Category = {
    id: `cat-${Date.now()}`,
    slug: slugify(nameEn || nameAr),
    name_ar: nameAr,
    name_en: nameEn,
    is_custom: true,
    created_at: new Date().toISOString(),
  };
  mockCategories.push(category);
  return category;
}

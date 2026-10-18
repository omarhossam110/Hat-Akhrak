"use server";

import { backendFetch } from "@/lib/backend/client";

/** Real "people who saved money this week"; null while it's too small to show. */
export async function getSavedThisWeek(): Promise<number | null> {
  try {
    const res = await backendFetch<{ savedThisWeek: number | null }>("/stats/public");
    return res.savedThisWeek;
  } catch {
    return null;
  }
}

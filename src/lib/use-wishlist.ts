"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * No backend/auth yet, so the wishlist is kept client-side in localStorage,
 * scoped to this browser only (same spirit as the dark-mode toggle). Once
 * real Supabase auth is wired up this should become a `wishlists` table
 * scoped to customer_id instead.
 */
const STORAGE_KEY = "hat-akhrak-wishlist";

function readIds(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage unavailable (private mode, etc.) — wishlist just won't persist
  }
}

/** Tracks a single deal's saved state + lets it be toggled. */
export function useWishlistItem(dealId: string) {
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSaved(readIds().includes(dealId));
  }, [dealId]);

  const toggle = useCallback(() => {
    const ids = readIds();
    const next = ids.includes(dealId) ? ids.filter((id) => id !== dealId) : [...ids, dealId];
    writeIds(next);
    setSaved(next.includes(dealId));
    window.dispatchEvent(new Event("hat-akhrak-wishlist-change"));
  }, [dealId]);

  return { saved: mounted ? saved : false, toggle, mounted };
}

/** Full list of saved deal ids, kept in sync across tabs/components. */
export function useWishlistIds() {
  const [ids, setIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sync = () => setIds(readIds());
    sync();
    window.addEventListener("hat-akhrak-wishlist-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("hat-akhrak-wishlist-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { ids: mounted ? ids : [], mounted };
}

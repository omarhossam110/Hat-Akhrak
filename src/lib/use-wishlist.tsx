"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { mergeWishlistAction, setWishlistAction } from "@/lib/actions/wishlist";

/**
 * Signed-in customers: the list lives in their account (server is the source
 * of truth, updates are optimistic and rolled back on failure). Guests,
 * merchants and admins keep the old per-browser localStorage list; when a
 * guest later signs in as a customer that list is merged into the account.
 */
const STORAGE_KEY = "hat-akhrak-wishlist";

function readLocal(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(ids: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage unavailable (private mode, etc.) — the list just won't persist
  }
}

interface WishlistContextValue {
  ids: string[];
  mounted: boolean;
  toggle: (dealId: string) => void;
}

const WishlistContext = createContext<WishlistContextValue>({ ids: [], mounted: false, toggle: () => {} });

/** `serverIds` is the account list, or null when there is no account list. */
export function WishlistProvider({
  serverIds,
  children,
}: {
  serverIds: string[] | null;
  children: React.ReactNode;
}) {
  const account = serverIds !== null;
  const [ids, setIds] = useState<string[]>(serverIds ?? []);
  const [mounted, setMounted] = useState(account);

  useEffect(() => {
    let cancelled = false;
    if (account) {
      const local = readLocal();
      if (local.length > 0) {
        void mergeWishlistAction(local).then((merged) => {
          if (cancelled || merged === null) return; // keep local copy if the merge failed
          writeLocal([]);
          setIds(merged);
        });
      }
      return () => {
        cancelled = true;
      };
    }
    const sync = () => setIds(readLocal());
    sync();
    setMounted(true);
    window.addEventListener("storage", sync);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", sync);
    };
  }, [account]);

  const toggle = useCallback(
    (dealId: string) => {
      const saved = ids.includes(dealId);
      const next = saved ? ids.filter((id) => id !== dealId) : [...ids, dealId];
      setIds(next);
      if (!account) {
        writeLocal(next);
        return;
      }
      void setWishlistAction(dealId, !saved).then((ok) => {
        if (!ok) setIds((cur) => (saved ? [...cur, dealId] : cur.filter((id) => id !== dealId)));
      });
    },
    [ids, account],
  );

  const value = useMemo(() => ({ ids, mounted, toggle }), [ids, mounted, toggle]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

/** Tracks a single deal's saved state + lets it be toggled. */
export function useWishlistItem(dealId: string) {
  const { ids, mounted, toggle } = useContext(WishlistContext);
  return { saved: mounted ? ids.includes(dealId) : false, toggle: () => toggle(dealId), mounted };
}

/** Full list of saved deal ids. */
export function useWishlistIds() {
  const { ids, mounted } = useContext(WishlistContext);
  return { ids: mounted ? ids : [], mounted };
}

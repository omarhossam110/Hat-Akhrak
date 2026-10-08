"use client";

import { useTranslations } from "next-intl";
import { useWishlistItem } from "@/lib/use-wishlist";

export function WishlistButton({
  dealId,
  compact = true,
}: {
  dealId: string;
  compact?: boolean;
}) {
  const t = useTranslations();
  const { saved, toggle } = useWishlistItem(dealId);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={saved ? t("wishlist.remove") : t("wishlist.add")}
      aria-pressed={saved}
      className={
        compact
          ? "grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[14px] transition hover:bg-white"
          : "inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-[11px] font-bold transition hover:bg-hover-soft"
      }
    >
      <span className={saved ? "text-danger" : "text-muted-2"} aria-hidden>
        {saved ? "♥" : "♡"}
      </span>
      {!compact && (saved ? t("wishlist.saved") : t("wishlist.add"))}
    </button>
  );
}

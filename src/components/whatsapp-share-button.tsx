"use client";

import { useLocale, useTranslations } from "next-intl";

/**
 * Generic "share via WhatsApp" button — builds a wa.me deep link with the
 * current origin + locale-prefixed path and an optional message, and opens
 * it in a new tab. Used on deal cards/details to help a deal's cycle reach
 * its next price tier faster by making it trivial to forward to a group.
 */
export function WhatsAppShareButton({
  path,
  message,
  compact = false,
}: {
  path: string;
  message: string;
  compact?: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations();

  function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/${locale}${path}`;
    const text = `${message}\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={t("deals.shareWhatsapp")}
      className={
        compact
          ? "grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[13px] text-success transition hover:bg-white"
          : "inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-[11px] font-bold text-success transition hover:bg-hover-soft"
      }
    >
      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 1.8a8.2 8.2 0 1 1 0 16.4 8.1 8.1 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 0 1 12 3.8Zm4.5 10.4c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.7.8-.8.9-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2-1.3-.8-.7-1.3-1.5-1.4-1.8-.1-.3 0-.4.1-.5l.3-.4c.1-.1.2-.2.2-.4.1-.1.1-.3 0-.4-.1-.1-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.3-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.6 2.5 3.9 3.5.5.2 1 .4 1.3.5.6.2 1.1.1 1.5.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.5-.3Z" />
      </svg>
      {!compact && t("deals.shareWhatsapp")}
    </button>
  );
}

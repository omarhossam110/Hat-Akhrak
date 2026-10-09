"use client";

import { useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import type { MockDealCard } from "@/lib/mock-deals";

const MAX_SUGGESTIONS = 5;

export function HeaderSearch({ deals }: { deals: MockDealCard[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return deals
      .filter((card) => {
        const title = locale === "ar" ? card.deal.title_ar ?? card.deal.title : card.deal.title_en ?? card.deal.title;
        return (
          title.toLowerCase().includes(term) ||
          card.merchant.business_name.toLowerCase().includes(term)
        );
      })
      .slice(0, MAX_SUGGESTIONS);
  }, [deals, query, locale]);

  function goToResults() {
    const term = query.trim();
    setOpen(false);
    router.push(term ? `/deals?q=${encodeURIComponent(term)}` : "/deals");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      goToResults();
    } else if (e.key === "Escape") {
      setOpen(false);
      (e.target as HTMLInputElement).blur();
    }
  }

  function handleBlur() {
    // Delay so a click on a dropdown item/link registers before we close it.
    blurTimeout.current = setTimeout(() => setOpen(false), 150);
  }

  function handleFocus() {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    if (query.trim()) setOpen(true);
  }

  return (
    <div className="relative hidden max-w-[470px] flex-1 sm:block">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(e.target.value.trim().length > 0);
        }}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={t("common.searchPlaceholder")}
        aria-label={t("common.searchPlaceholder")}
        className="h-11 w-full rounded-[14px] border border-line bg-surface-2 ps-11 pe-4 text-sm outline-none transition focus:border-focus-border focus:bg-surface focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
      />
      <span className="pointer-events-none absolute inset-y-0 start-4 flex items-center text-muted-2">
        ⌕
      </span>

      {open && query.trim() && (
        <div className="absolute top-[calc(100%+8px)] start-0 z-50 w-full overflow-hidden rounded-[16px] border border-line bg-surface shadow-[var(--shadow-card-lg)]">
          {matches.length === 0 ? (
            <p className="px-4 py-4 text-center text-xs text-muted">
              {t("common.searchNoResults")}
            </p>
          ) : (
            <div className="flex flex-col">
              {matches.map((card) => {
                const title =
                  locale === "ar" ? card.deal.title_ar ?? card.deal.title : card.deal.title_en ?? card.deal.title;
                const activeTier = card.cycle.final_tier_reached
                  ? card.tiers.find((tr) => tr.tier_number === card.cycle.final_tier_reached)
                  : card.tiers[0];
                return (
                  <Link
                    key={card.deal.id}
                    href={`/deals/${card.deal.id}`}
                    className="flex items-center gap-3 px-4 py-2.5 text-start text-xs transition hover:bg-hover-soft"
                  >
                    <span
                      className={`product-art-${card.artVariant} grid h-9 w-9 shrink-0 place-items-center rounded-lg text-base text-white`}
                    >
                      {card.icon}
                    </span>
                    <span className="flex-1 truncate font-bold">{title}</span>
                    <span className="shrink-0 font-sans font-extrabold text-brand">
                      {activeTier?.price_per_unit} {t("common.egp")}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
          <button
            type="button"
            onClick={goToResults}
            className="block w-full border-t border-line px-4 py-2.5 text-center text-xs font-extrabold text-brand transition hover:bg-hover-soft"
          >
            {t("common.searchSeeAll", { query: query.trim() })} →
          </button>
        </div>
      )}
    </div>
  );
}

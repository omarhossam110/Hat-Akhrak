"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { mockDeals } from "@/lib/mock-deals";
import { useWishlistIds } from "@/lib/use-wishlist";
import { DealCard } from "@/components/deal-card";

export default function WishlistPage() {
  const t = useTranslations();
  const { ids, mounted } = useWishlistIds();

  const savedDeals = mockDeals.filter((card) => ids.includes(card.deal.id));

  return (
    <div className="mx-auto max-w-[1180px] px-[22px] py-[30px]">
      <h1 className="text-[26px] font-extrabold tracking-tight sm:text-[30px]">
        {t("wishlist.title")}
      </h1>
      <p className="mt-1.5 text-muted">{t("wishlist.subtitle")}</p>

      {!mounted ? null : savedDeals.length === 0 ? (
        <div className="mt-7 flex flex-col items-center gap-3 rounded-[22px] border border-line bg-surface px-6 py-16 text-center shadow-[var(--shadow-card)]">
          <span className="text-[44px]">🤍</span>
          <h2 className="text-base font-extrabold">{t("wishlist.emptyTitle")}</h2>
          <p className="max-w-[360px] text-sm text-muted">{t("wishlist.emptyDesc")}</p>
          <Link
            href="/deals"
            className="mt-2 rounded-xl bg-brand px-5 py-2.5 text-xs font-black text-[#151515] transition hover:brightness-95"
          >
            {t("wishlist.emptyCta")} →
          </Link>
        </div>
      ) : (
        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedDeals.map((card) => (
            <DealCard key={card.deal.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}

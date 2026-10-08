"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { MockDealCard } from "@/lib/mock-deals";
import { CycleCountdown } from "@/components/cycle-countdown";
import { WhatsAppShareButton } from "@/components/whatsapp-share-button";
import { WishlistButton } from "@/components/wishlist-button";

export function DealCard({ card }: { card: MockDealCard }) {
  const t = useTranslations();
  const locale = useLocale();

  const { deal, tiers, cycle, merchant, icon, artVariant } = card;
  const title = locale === "ar" ? deal.title_ar ?? deal.title : deal.title_en ?? deal.title;

  const sold = cycle.units_sold;
  const total = cycle.stock_allocated;
  const progressPct = Math.min(100, (sold / total) * 100);

  const firstTier = tiers[0];
  const activeTier = cycle.final_tier_reached
    ? tiers.find((tr) => tr.tier_number === cycle.final_tier_reached)
    : firstTier;

  return (
    <article className="group overflow-hidden rounded-[22px] border border-line bg-surface shadow-[0_5px_20px_rgba(16,24,40,0.04)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card-lg)]">
      <div
        className={`product-art-${artVariant} relative grid h-[175px] place-items-center text-[66px] text-white`}
      >
        <span>{icon}</span>
        {merchant.is_verified && (
          <b className="absolute end-3 top-3 rounded-full bg-white px-2.5 py-1.5 text-[10px] font-black text-danger">
            ✓ {t("deals.verifiedMerchant")}
          </b>
        )}
        <div className="absolute start-3 top-3 flex items-center gap-1.5">
          <WishlistButton dealId={deal.id} />
          <WhatsAppShareButton
            path={`/deals/${deal.id}`}
            message={t("deals.shareMessage", { title })}
            compact
          />
        </div>
      </div>

      <div className="p-[17px]">
        <div className="mb-2 text-[16px] font-extrabold">{title}</div>
        <p className="mb-2 -mt-1 text-xs text-muted">{merchant.business_name}</p>

        <div className="flex items-baseline gap-2">
          <span className="font-sans text-[21px] font-extrabold text-brand">
            {activeTier?.price_per_unit} {t("common.egp")}
          </span>
          {activeTier !== firstTier && (
            <span className="text-[11px] text-muted-2 line-through">
              {firstTier.price_per_unit} {t("common.egp")}
            </span>
          )}
        </div>

        <div className="mt-3.5 mb-[7px] h-2 overflow-hidden rounded-full bg-neutral-soft">
          <span
            className="block h-full rounded-full bg-gradient-to-r from-brand to-brand-2"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted">
          <span>{t("deals.buyersCount", { sold, total })}</span>
          <span>{t("deals.unitsLeft", { count: deal.remaining_stock })}</span>
        </div>

        <div className="mt-3.5 flex items-center justify-between">
          <span className="flex items-center gap-1 rounded-lg bg-warning-soft px-2 py-1.5 text-[10px] font-extrabold text-warning">
            <span aria-hidden>⏱</span>
            <CycleCountdown endsAt={cycle.ends_at} compact />
          </span>
          <Link
            href={`/deals/${deal.id}`}
            className="rounded-xl bg-brand px-[15px] py-[11px] text-xs font-black text-[#151515] transition hover:brightness-95"
          >
            {t("deals.viewDeal")}
          </Link>
        </div>
      </div>
    </article>
  );
}

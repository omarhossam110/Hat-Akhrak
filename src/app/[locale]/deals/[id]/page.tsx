import { getTranslations, getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getDealById } from "@/lib/mock-deals";
import { CycleCountdown } from "@/components/cycle-countdown";

export default async function DealDetailsPage({
  params,
}: PageProps<"/[locale]/deals/[id]">) {
  const { id } = await params;
  const card = getDealById(id);

  if (!card) notFound();

  const t = await getTranslations();
  const locale = await getLocale();

  const { deal, tiers, cycle, merchant, icon, artVariant, depositAmount } = card;
  const title = locale === "ar" ? deal.title_ar ?? deal.title : deal.title_en ?? deal.title;
  const activeTier = cycle.final_tier_reached
    ? tiers.find((tr) => tr.tier_number === cycle.final_tier_reached)
    : tiers[0];
  const firstTier = tiers[0];
  const maxQty = Math.min(2, deal.remaining_stock);

  return (
    <div className="mx-auto max-w-[1180px] px-[22px] py-[30px]">
      <Link
        href="/deals"
        className="mb-4 inline-block text-xs font-extrabold text-brand"
      >
        {t("deals.backToDeals")}
      </Link>
      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1fr_0.78fr]">
        {/* Big product art */}
        <div className="rounded-[22px] border border-line bg-white p-[22px] shadow-[var(--shadow-card)]">
          <div
            className={`product-art-${artVariant} relative grid h-[300px] place-items-center rounded-[20px] text-[90px] text-white sm:h-[430px] sm:text-[125px]`}
          >
            <span>{icon}</span>
            <b className="absolute start-6 top-6 rounded-[9px] bg-white px-2.5 py-2 text-[10px] font-black tracking-wide text-ink">
              {t("deals.limited").toUpperCase()}
            </b>
          </div>
        </div>

        {/* Info card */}
        <div className="rounded-[22px] border border-line bg-white p-[22px] shadow-[var(--shadow-card)]">
          <div className="mb-1.5 text-xs font-extrabold text-brand">
            {t("deals.groupDeal")} • {t("deals.verifiedMerchant")}
          </div>
          <h1 className="mb-1.5 text-[26px] font-extrabold tracking-tight sm:text-[30px]">
            {title}
          </h1>
          <div className="mb-5 text-xs text-[#b54708]">
            ★★★★★{" "}
            <span className="text-muted">
              {merchant.rating} • {merchant.review_count}
            </span>
          </div>

          <Link
            href={`/merchants/${deal.merchant_id}`}
            className="mb-3.5 inline-block text-xs font-extrabold text-brand"
          >
            {t("deals.soldBy")} {merchant.business_name} ✓
          </Link>

          <div className="text-xs text-muted">{t("deals.currentTier")}</div>
          <div className="my-1 flex items-baseline gap-2">
            <span className="font-sans text-[29px] font-extrabold text-brand">
              {activeTier?.price_per_unit} {t("common.egp")}
            </span>
            {activeTier !== firstTier && (
              <span className="text-[11px] text-[#98a2b3] line-through">
                {firstTier.price_per_unit} {t("common.egp")}
              </span>
            )}
          </div>

          <h2 className="mb-2 mt-4 text-[13px] font-bold">{t("deals.priceTiers")}</h2>
          <div className="mb-4 grid grid-cols-3 gap-2">
            {tiers.map((tier) => {
              const reached =
                cycle.final_tier_reached !== null &&
                cycle.final_tier_reached >= tier.tier_number;
              return (
                <div
                  key={tier.id}
                  className={`rounded-[14px] border text-center ${
                    reached
                      ? "border-2 border-success bg-success-soft p-[11px]"
                      : "border-line bg-white p-3"
                  }`}
                >
                  <small className="mb-1 block text-[10px] text-muted">
                    {tier.min_buyers}–{tier.max_buyers} {t("deals.buyers")}
                  </small>
                  <b
                    className={`font-sans text-[15px] ${reached ? "text-success" : ""}`}
                  >
                    {tier.price_per_unit} {t("common.egp")}
                  </b>
                </div>
              );
            })}
          </div>

          <div className="rounded-[17px] border border-[#ffe0b2] bg-[#fffaf3] p-[15px]">
            <div className="mb-2.5 flex items-center justify-between text-xs">
              <b>{t("deals.deposit")}</b>
              <strong className="font-sans">
                {depositAmount} {t("common.egp")}
              </strong>
            </div>
            <label className="sr-only" htmlFor="qty">
              {t("deals.quantity")}
            </label>
            <select
              id="qty"
              className="mb-2.5 w-full rounded-xl border border-line bg-white p-[11px] outline-none"
            >
              {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <Link
              href={`/signup?redirect=${encodeURIComponent(`/deals/${deal.id}`)}`}
              className="block w-full rounded-xl bg-brand px-4 py-[11px] text-center text-xs font-black text-[#151515] transition hover:brightness-95"
            >
              {t("deals.joinNow")} →
            </Link>
          </div>

          <div className="mt-3 rounded-[13px] bg-brand-soft p-3.5 text-[11px] leading-relaxed text-[#9a4d00]">
            ⚠ {t("deals.noticeLead")}{" "}
            <CycleCountdown endsAt={cycle.ends_at} compact /> —{" "}
            {t("deals.noticeTail")}
          </div>
        </div>
      </div>
    </div>
  );
}

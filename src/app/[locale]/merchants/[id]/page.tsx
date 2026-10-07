import { getTranslations, getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getMerchantById, getDealsByMerchant } from "@/lib/mock-merchants";
import { DealCard } from "@/components/deal-card";

export default async function MerchantProfilePage({
  params,
}: PageProps<"/[locale]/merchants/[id]">) {
  const { id } = await params;
  const merchant = getMerchantById(id);

  if (!merchant) notFound();

  const t = await getTranslations();
  const locale = await getLocale();
  const deals = getDealsByMerchant(id);
  const bio = locale === "ar" ? merchant.bio_ar : merchant.bio_en;

  return (
    <div className="mx-auto max-w-[1180px] px-[22px] py-[30px]">
      <div className="rounded-[22px] border border-line bg-surface p-[22px] shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-4">
          <div
            className={`product-art-${merchant.avatarVariant} grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-[26px] text-white`}
          >
            🏪
          </div>
          <div>
            <h1 className="mb-1 text-[22px] font-extrabold">{merchant.business_name}</h1>
            {merchant.is_verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-xs font-extrabold text-success">
                ✓ {t("deals.verifiedMerchant")}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-[22px]">
          <div className="text-xs text-muted">
            <b className="block font-sans text-lg text-ink">{merchant.rating} ★</b>
            {t("merchantProfile.rating")}
          </div>
          <div className="text-xs text-muted">
            <b className="block font-sans text-lg text-ink">{merchant.review_count}</b>
            {t("merchantProfile.reviews")}
          </div>
          <div className="text-xs text-muted">
            <b className="block font-sans text-lg text-ink">{merchant.completed_deals}</b>
            {t("merchantProfile.completedDeals")}
          </div>
          <div className="text-xs text-muted">
            <b className="block font-sans text-lg text-ink">{merchant.member_since}</b>
            {t("merchantProfile.memberSince")}
          </div>
        </div>

        <p className="mt-3.5 text-xs leading-relaxed text-muted">{bio}</p>
      </div>

      <div className="mb-3.5 mt-[27px] flex items-end justify-between">
        <h2 className="text-[19px] font-bold tracking-tight">
          {t("merchantProfile.openDealsTitle")}
        </h2>
      </div>

      {deals.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((card) => (
            <DealCard key={card.deal.id} card={card} />
          ))}
        </div>
      ) : (
        <p className="rounded-[22px] border border-line bg-surface p-8 text-center text-sm text-muted">
          {t("merchantProfile.noOpenDeals")}
        </p>
      )}

      <Link
        href="/deals"
        className="mt-6 inline-block text-xs font-extrabold text-brand"
      >
        {t("merchantProfile.backToDeals")}
      </Link>
    </div>
  );
}

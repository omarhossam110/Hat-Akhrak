import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { mockMerchants } from "@/lib/mock-merchants";

export default async function MerchantsListPage() {
  const t = await getTranslations();
  const locale = await getLocale();

  return (
    <div className="mx-auto max-w-[1180px] px-[22px] py-[30px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mb-1.5 text-[26px] font-extrabold tracking-tight sm:text-[30px]">
            {t("merchantsList.title")}
          </h1>
          <p className="text-sm text-muted">{t("merchantsList.subtitle")}</p>
        </div>
        <Link
          href="/merchant/signup"
          className="rounded-xl bg-brand px-4 py-2.5 text-xs font-black text-[#151515] transition hover:brightness-95"
        >
          {t("merchantsList.sellWithUs")} →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockMerchants.map((merchant) => {
          const bio = locale === "ar" ? merchant.bio_ar : merchant.bio_en;
          return (
            <Link
              key={merchant.id}
              href={`/merchants/${merchant.id}`}
              className="group flex flex-col rounded-[22px] border border-line bg-surface p-[18px] shadow-[0_5px_20px_rgba(16,24,40,.04)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-card-lg)]"
            >
              <div className="mb-3.5 flex items-center gap-3">
                <div
                  className={`product-art-${merchant.avatarVariant} grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-xl text-white`}
                >
                  🏪
                </div>
                <div>
                  <h2 className="text-[15px] font-extrabold">{merchant.business_name}</h2>
                  {merchant.is_verified && (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-extrabold text-success">
                      ✓ {t("deals.verifiedMerchant")}
                    </span>
                  )}
                </div>
              </div>

              <p className="mb-3.5 flex-1 text-xs leading-relaxed text-muted">{bio}</p>

              <div className="mb-3.5 flex gap-[18px] border-t border-line pt-3 text-[11px] text-muted">
                <div>
                  <b className="block font-sans text-sm text-ink">{merchant.rating} ★</b>
                  {t("merchantProfile.rating")}
                </div>
                <div>
                  <b className="block font-sans text-sm text-ink">{merchant.completed_deals}</b>
                  {t("merchantProfile.completedDeals")}
                </div>
                <div>
                  <b className="block font-sans text-sm text-ink">{merchant.member_since}</b>
                  {t("merchantProfile.memberSince")}
                </div>
              </div>

              <span className="text-xs font-extrabold text-brand">
                {t("merchantsList.viewProfile")} →
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { mockDeals } from "@/lib/mock-deals";
import { DealCard } from "@/components/deal-card";

export default async function HomePage() {
  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-[1180px] px-[22px] py-[30px]">
      {/* Hero */}
      <section className="mb-6 grid grid-cols-1 gap-[18px] md:grid-cols-[1.35fr_0.65fr]">
        <div className="hero-main-bg relative min-h-[245px] overflow-hidden rounded-[28px] p-[30px] text-white">
          <div
            className="pointer-events-none absolute -bottom-[130px] -start-[70px] h-[240px] w-[240px] rounded-full border border-white/10"
            aria-hidden
          />
          <div className="relative font-sans text-[17px] font-extrabold text-[#ffc15a]">
            {t("home.heroNumber")}
          </div>
          <h1 className="relative mb-3.5 mt-2 max-w-[590px] text-[28px] leading-tight tracking-tight sm:text-[37px]">
            {t("home.heroTitle")}
          </h1>
          <p className="relative max-w-[540px] text-[#d0d5dd] leading-7">
            {t("home.heroDesc")}
          </p>
          <Link
            href="/deals"
            className="relative mt-6 inline-flex rounded-xl bg-brand px-4 py-[11px] text-xs font-black text-[#151515] transition hover:brightness-95"
          >
            {t("home.exploreCta")} →
          </Link>
        </div>

        <aside className="flex flex-col justify-between rounded-[28px] border border-line bg-surface p-[25px] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <div>
              <strong className="font-sans text-[30px]">{t("home.heroNumber")}</strong>
              <small className="mt-0.5 block text-xs text-muted">
                {t("home.heroMetric")}
              </small>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-[22px]">
              ↗
            </div>
          </div>
          <div>
            <div className="my-[17px] h-px bg-line" />
            <div className="text-[11px] text-muted">{t("home.sideNote")}</div>
          </div>
        </aside>
      </section>

      {/* Open deals */}
      <div className="mb-3.5 mt-[27px] flex items-end justify-between">
        <h2 className="text-[19px] font-bold tracking-tight">{t("deals.openDeals")}</h2>
        <Link href="/deals" className="text-xs font-extrabold text-brand">
          {t("common.viewAll")} →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockDeals.map((card) => (
          <DealCard key={card.deal.id} card={card} />
        ))}
      </div>
    </div>
  );
}

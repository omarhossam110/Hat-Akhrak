import { getTranslations } from "next-intl/server";
import { mockDeals } from "@/lib/mock-deals";
import { DealCard } from "@/components/deal-card";

export default async function DealsPage() {
  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-[1180px] px-[22px] py-[30px]">
      <h1 className="text-[28px] font-extrabold tracking-tight sm:text-[34px]">
        {t("deals.pageTitle")}
      </h1>
      <p className="mt-1.5 text-muted">{t("deals.pageSubtitle")}</p>

      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockDeals.map((card) => (
          <DealCard key={card.deal.id} card={card} />
        ))}
      </div>
    </div>
  );
}

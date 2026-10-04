import { getTranslations } from "next-intl/server";
import { mockDeals } from "@/lib/mock-deals";
import { DealCard } from "@/components/deal-card";

export default async function DealsPage() {
  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-extrabold text-navy-950 sm:text-3xl">
        {t("deals.pageTitle")}
      </h1>
      <p className="mt-2 text-neutral-600">{t("deals.pageSubtitle")}</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockDeals.map((card) => (
          <DealCard key={card.deal.id} card={card} />
        ))}
      </div>
    </div>
  );
}

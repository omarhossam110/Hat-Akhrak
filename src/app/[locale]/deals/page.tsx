import { getTranslations } from "next-intl/server";
import { mockDeals } from "@/lib/mock-deals";
import { mockCategories } from "@/lib/mock-categories";
import { DealsExplorer } from "@/components/deals-explorer";

export default async function DealsPage({
  searchParams,
}: PageProps<"/[locale]/deals">) {
  const t = await getTranslations();
  const { q } = await searchParams;
  const initialQuery = typeof q === "string" ? q : "";

  return (
    <div className="mx-auto max-w-[1180px] px-[22px] py-[30px]">
      <h1 className="text-[28px] font-extrabold tracking-tight sm:text-[34px]">
        {t("deals.pageTitle")}
      </h1>
      <p className="mt-1.5 text-muted">{t("deals.pageSubtitle")}</p>

      <DealsExplorer deals={mockDeals} categories={mockCategories} initialQuery={initialQuery} />
    </div>
  );
}

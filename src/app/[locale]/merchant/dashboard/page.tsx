import { getTranslations, getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getMyDeals } from "@/lib/actions/merchant-deals";
import { MerchantDealsTable } from "@/components/merchant-deals-table";
import { getSession } from "@/lib/auth/session";

export default async function MerchantDashboardPage({
  searchParams,
}: PageProps<"/[locale]/merchant/dashboard">) {
  const t = await getTranslations();
  const locale = await getLocale();
  const { dealCreated } = await searchParams;

  const session = await getSession();
  if (!session) {
    redirect(`/${locale}/login?redirect=${encodeURIComponent("/merchant/dashboard")}`);
  }
  if (session.role !== "merchant") {
    redirect(`/${locale}/`);
  }

  const { rows: merchantDeals, stats: merchantStats, hasAlert: merchantHasAlert } = await getMyDeals();

  const stats = [
    { icon: "📦", value: merchantStats.totalDeals, label: t("merchantDashboard.statTotalDeals") },
    { icon: "📈", value: merchantStats.unitsSold, label: t("merchantDashboard.statUnitsSold") },
    {
      icon: "💰",
      value: `${merchantStats.revenue.toLocaleString()} ${t("common.egp")}`,
      label: t("merchantDashboard.statRevenue"),
    },
  ];

  return (
    <div className="mx-auto max-w-[1180px] px-[22px] py-[30px]">
      {dealCreated === "1" && (
        <div className="mb-4 rounded-[15px] border border-success-border bg-success-soft p-3.5 text-xs text-success">
          ✓ {t("merchantDashboard.dealCreated")}
        </div>
      )}

      {merchantHasAlert && (
        <div className="mb-4 rounded-[15px] border border-danger-border bg-danger-soft p-3.5 text-xs text-danger">
          ⚠ {t("merchantDashboard.alert")}
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[18px] border border-line bg-surface p-[17px] shadow-[var(--shadow-card)]"
          >
            <div className="mb-3.5 text-xl">{stat.icon}</div>
            <b className="block font-sans text-[23px]">{stat.value}</b>
            <span className="text-[11px] text-muted">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[22px] font-extrabold tracking-tight sm:text-[26px]">
          {t("merchantDashboard.title")}
        </h1>
        <Link
          href="/merchant/deals/new"
          className="rounded-xl bg-brand px-4 py-2.5 text-xs font-black text-[#151515] transition hover:brightness-95"
        >
          + {t("merchantDashboard.newDeal")}
        </Link>
      </div>

      {merchantDeals.length > 0 ? (
        <MerchantDealsTable rows={merchantDeals} />
      ) : (
        <div className="rounded-[22px] border border-line bg-surface p-10 text-center shadow-[var(--shadow-card)]">
          <p className="mb-1.5 font-bold">{t("merchantDashboard.emptyTitle")}</p>
          <p className="mb-5 text-xs text-muted">{t("merchantDashboard.emptyDesc")}</p>
          <Link
            href="/merchant/deals/new"
            className="inline-block rounded-xl bg-brand px-4 py-2.5 text-xs font-black text-[#151515] transition hover:brightness-95"
          >
            + {t("merchantDashboard.newDeal")}
          </Link>
        </div>
      )}
    </div>
  );
}

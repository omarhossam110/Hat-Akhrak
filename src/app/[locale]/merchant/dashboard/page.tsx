import { getTranslations, getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { merchantDeals, merchantHasAlert, merchantStats } from "@/lib/mock-merchant-dashboard";
import { MerchantDealsTable } from "@/components/merchant-deals-table";
import { getSession } from "@/lib/auth/session";

export default async function MerchantDashboardPage() {
  const t = await getTranslations();
  const locale = await getLocale();

  const session = await getSession();
  if (!session) {
    redirect(`/${locale}/login?redirect=${encodeURIComponent("/merchant/dashboard")}`);
  }
  if (session.role !== "merchant") {
    redirect(`/${locale}/`);
  }

  // NOTE: still showing mock deals/stats — only the merchant-role gate
  // above is wired to the real backend so far, not the dashboard's data.

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

      <MerchantDealsTable rows={merchantDeals} />
    </div>
  );
}

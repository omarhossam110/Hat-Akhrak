import { getTranslations, getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { getLedger } from "@/lib/actions/ledger";
import { RecordPayoutForm } from "@/components/record-payout-form";
import { addCategoryAction, getCategories } from "@/lib/actions/categories";
import {
  approveMerchantApplicationAction,
  rejectMerchantApplicationAction,
  getPendingMerchants,
} from "@/lib/actions/merchant-applications";
import { getDeals } from "@/lib/actions/public-deals";
import { getDisputes } from "@/lib/actions/disputes";
import { DisputeQueue } from "@/components/dispute-queue";
import { EmergencyCancelForm } from "@/components/emergency-cancel-form";
import { AdminAnalytics } from "@/components/admin-analytics";
import { getSession } from "@/lib/auth/session";
import { Link } from "@/i18n/navigation";

export default async function SuperAdminPage() {
  const t = await getTranslations();
  const locale = await getLocale();

  const session = await getSession();
  if (!session) {
    redirect(`/${locale}/login?redirect=${encodeURIComponent("/super-admin")}`);
  }
  if (session.role !== "super_admin") {
    redirect(`/${locale}/`);
  }

  // Everything here is real: applications, categories, deals and the
  // settlement ledger (aggregated from orders/payments, with payouts).
  const { merchants: pendingMerchants } = await getPendingMerchants();
  const pendingCount = pendingMerchants.filter((m) => m.status === "pending").length;
  const [realCategories, realDeals, merchantLedger, disputes] = await Promise.all([
    getCategories(),
    getDeals(),
    getLedger(),
    getDisputes(),
  ]);
  const openDisputes = disputes.filter((d) => d.status === "open").length;

  return (
    <div className="mx-auto max-w-[1180px] px-[22px] py-[30px]">
      {!session.mfa && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-warning-soft px-4 py-3 text-xs font-bold text-warning">
          <span>{t("twoFactor.bannerText")}</span>
          <Link href="/super-admin/security" className="underline">
            {t("twoFactor.bannerLink")}
          </Link>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
        <div className="flex flex-col gap-4">
          <AdminAnalytics ledger={merchantLedger} deals={realDeals} categories={realCategories} />

          <div className="rounded-[22px] border border-line bg-surface p-[22px] shadow-[var(--shadow-card)]">
          <div className="mb-2.5 flex items-center justify-between">
            <h1 className="text-[19px] font-bold tracking-tight">{t("superAdmin.title")}</h1>
            <span className="inline-flex rounded-full bg-info-soft px-2.5 py-1.5 text-[10px] font-extrabold text-info-text">
              {t("superAdmin.settlementPill")}
            </span>
          </div>

          <div className="space-y-3 sm:hidden">
            {merchantLedger.length === 0 && (
              <p className="py-6 text-center text-xs text-muted">{t("superAdmin.ledgerEmpty")}</p>
            )}
            {merchantLedger.map((row) => (
              <div key={row.merchantId} className="rounded-[16px] border border-line p-3.5">
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <span className="font-bold">{row.businessName}</span>
                  <span className="font-sans text-xs text-muted">
                    {t("superAdmin.completed")}: {row.completedDeals}
                  </span>
                </div>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  {(
                    [
                      ["collected", row.collected],
                      ["commission", row.commission],
                      ["held", row.held],
                      ["paidOut", row.paidOut],
                    ] as const
                  ).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-[10px] font-bold text-muted-2">{t(`superAdmin.${key}`)}</dt>
                      <dd className="font-sans">
                        {value.toLocaleString()} {t("common.egp")}
                      </dd>
                    </div>
                  ))}
                  <div className="col-span-2 border-t border-line pt-2">
                    <dt className="text-[10px] font-bold text-muted-2">{t("superAdmin.owed")}</dt>
                    <dd className="font-sans font-bold">
                      {row.owed.toLocaleString()} {t("common.egp")}
                    </dd>
                  </div>
                </dl>
                {row.owed > 0 && (
                  <div className="mt-3">
                    <RecordPayoutForm merchantId={row.merchantId} owed={row.owed} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="hidden overflow-auto sm:block">
            <table className="w-full min-w-[860px] text-start text-sm">
              <thead>
                <tr className="border-b border-line text-[10px] font-bold text-muted-2">
                  <th className="px-2.5 py-3.5 text-start">{t("superAdmin.merchant")}</th>
                  <th className="px-2.5 py-3.5 text-start">{t("superAdmin.completed")}</th>
                  <th className="px-2.5 py-3.5 text-start">{t("superAdmin.collected")}</th>
                  <th className="px-2.5 py-3.5 text-start">{t("superAdmin.commission")}</th>
                  <th className="px-2.5 py-3.5 text-start">{t("superAdmin.held")}</th>
                  <th className="px-2.5 py-3.5 text-start">{t("superAdmin.paidOut")}</th>
                  <th className="px-2.5 py-3.5 text-start">{t("superAdmin.owed")}</th>
                  <th className="px-2.5 py-3.5 text-start">{t("superAdmin.payout")}</th>
                </tr>
              </thead>
              <tbody>
                {merchantLedger.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-2.5 py-6 text-center text-xs text-muted">
                      {t("superAdmin.ledgerEmpty")}
                    </td>
                  </tr>
                )}
                {merchantLedger.map((row) => (
                  <tr key={row.merchantId} className="border-b border-line last:border-0">
                    <td className="px-2.5 py-3.5 font-bold">{row.businessName}</td>
                    <td className="px-2.5 py-3.5 font-sans">{row.completedDeals}</td>
                    <td className="px-2.5 py-3.5 font-sans">
                      {row.collected.toLocaleString()} {t("common.egp")}
                    </td>
                    <td className="px-2.5 py-3.5 font-sans">
                      {row.commission.toLocaleString()} {t("common.egp")}
                    </td>
                    <td className="px-2.5 py-3.5 font-sans">
                      {row.held.toLocaleString()} {t("common.egp")}
                    </td>
                    <td className="px-2.5 py-3.5 font-sans">
                      {row.paidOut.toLocaleString()} {t("common.egp")}
                    </td>
                    <td className="px-2.5 py-3.5 font-sans font-bold">
                      {row.owed.toLocaleString()} {t("common.egp")}
                    </td>
                    <td className="px-2.5 py-3.5">
                      {row.owed > 0 ? (
                        <RecordPayoutForm merchantId={row.merchantId} owed={row.owed} />
                      ) : (
                        <span className="text-[10px] text-muted-2">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[22px] border border-line bg-surface p-[22px] shadow-[var(--shadow-card)]">
          <div className="mb-3.5 flex items-center justify-between">
            <h2 className="text-[16px] font-bold tracking-tight">{t("disputes.title")}</h2>
            {openDisputes > 0 && (
              <span className="inline-flex rounded-full bg-danger-soft px-2.5 py-1.5 text-[10px] font-extrabold text-danger">
                {t("disputes.openCount", { count: openDisputes })}
              </span>
            )}
          </div>
          <DisputeQueue disputes={disputes} />
        </div>

        <div className="rounded-[22px] border border-line bg-surface p-[22px] shadow-[var(--shadow-card)]">
          <div className="mb-3.5 flex items-center justify-between">
            <h2 className="text-[16px] font-bold tracking-tight">
              {t("superAdmin.applications.title")}
            </h2>
            {pendingCount > 0 && (
              <span className="inline-flex rounded-full bg-warning-soft px-2.5 py-1.5 text-[10px] font-extrabold text-warning">
                {t("superAdmin.applications.pendingCount", { count: pendingCount })}
              </span>
            )}
          </div>

          {pendingMerchants.length === 0 ? (
            <p className="text-xs text-muted">{t("superAdmin.applications.empty")}</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {pendingMerchants.map((application) => (
                <div
                  key={application.id}
                  className="rounded-xl border border-line p-3.5 text-xs"
                >
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                    <b className="text-[13px]">{application.businessName}</b>
                    {application.status === "pending" ? (
                      <span className="rounded-full bg-warning-soft px-2.5 py-1 text-[10px] font-extrabold text-warning">
                        {t("superAdmin.applications.statusPending")}
                      </span>
                    ) : (
                      <span className="rounded-full bg-neutral-soft px-2.5 py-1 text-[10px] font-extrabold text-neutral">
                        {t("superAdmin.applications.statusRejected")}
                      </span>
                    )}
                  </div>
                  <p className="mb-2.5 text-muted">
                    {application.ownerName}
                    {application.phone ? ` • ${application.phone}` : ""} • {application.email}
                  </p>
                  {application.status === "pending" && (
                    <div className="flex gap-2">
                      <form action={approveMerchantApplicationAction}>
                        <input type="hidden" name="application_id" value={application.id} />
                        <button
                          type="submit"
                          className="rounded-lg bg-success px-3 py-1.5 text-[11px] font-extrabold text-white transition hover:brightness-95"
                        >
                          {t("superAdmin.applications.approve")}
                        </button>
                      </form>
                      <form action={rejectMerchantApplicationAction}>
                        <input type="hidden" name="application_id" value={application.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-line px-3 py-1.5 text-[11px] font-bold text-ink transition hover:bg-paper"
                        >
                          {t("superAdmin.applications.reject")}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[22px] border border-line bg-surface p-[22px] shadow-[var(--shadow-card)]">
          <h2 className="mb-3.5 text-[16px] font-bold tracking-tight">
            {t("superAdmin.categories.title")}
          </h2>

          <div className="flex flex-wrap gap-2">
            {realCategories.map((cat) => (
              <span
                key={cat.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-neutral-soft px-3 py-1.5 text-xs font-bold text-foreground"
              >
                {locale === "ar" ? cat.name_ar : cat.name_en}
                {cat.is_custom && (
                  <b className="rounded-full bg-info-soft px-1.5 py-0.5 text-[9px] font-extrabold text-info-text">
                    {t("superAdmin.categories.customBadge")}
                  </b>
                )}
              </span>
            ))}
          </div>

          <form action={addCategoryAction} className="mt-4 border-t border-line pt-4">
            <h3 className="mb-2.5 text-xs font-bold text-muted">
              {t("superAdmin.categories.addTitle")}
            </h3>
            <div className="flex flex-wrap gap-2.5">
              <input
                type="text"
                name="name_ar"
                required
                placeholder={t("superAdmin.categories.nameArPlaceholder")}
                aria-label={t("superAdmin.categories.nameArLabel")}
                className="h-11 min-w-[180px] flex-1 rounded-xl border border-line bg-surface px-3.5 text-xs outline-none transition focus:border-brand"
              />
              <input
                type="text"
                name="name_en"
                required
                placeholder={t("superAdmin.categories.nameEnPlaceholder")}
                aria-label={t("superAdmin.categories.nameEnLabel")}
                className="h-11 min-w-[180px] flex-1 rounded-xl border border-line bg-surface px-3.5 text-xs outline-none transition focus:border-brand"
              />
              <button
                type="submit"
                className="h-11 rounded-xl bg-brand px-5 text-xs font-black text-[#151515] transition hover:brightness-95"
              >
                {t("superAdmin.categories.addButton")}
              </button>
            </div>
          </form>
        </div>
        </div>

        <aside className="rounded-[22px] bg-[#101828] p-[22px] text-white">
          <div className="mb-1.5 text-[28px]">⚡</div>
          <h3 className="mb-1.5 text-base font-extrabold">{t("superAdmin.adminControlsTitle")}</h3>
          <p className="text-[11px] leading-relaxed text-[#98a2b3]">
            {t("superAdmin.adminControlsDesc")}
          </p>
          <EmergencyCancelForm
            deals={realDeals.map((c) => ({
              id: c.deal.id,
              title: locale === "ar" ? (c.deal.title_ar ?? c.deal.title) : (c.deal.title_en ?? c.deal.title),
            }))}
          />
          <Link
            href="/super-admin/security"
            className="mt-2 block rounded-xl border border-[#344054] px-4 py-[11px] text-center text-xs font-bold text-white transition hover:bg-[#1d2939]"
          >
            {t("twoFactor.securityLink")}
          </Link>
        </aside>
      </div>
    </div>
  );
}

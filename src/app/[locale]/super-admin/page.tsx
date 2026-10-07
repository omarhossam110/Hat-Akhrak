import { getTranslations } from "next-intl/server";
import { merchantLedger } from "@/lib/mock-admin-ledger";

export default async function SuperAdminPage() {
  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-[1180px] px-[22px] py-[30px]">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
        <div className="rounded-[22px] border border-line bg-surface p-[22px] shadow-[var(--shadow-card)]">
          <div className="mb-2.5 flex items-center justify-between">
            <h1 className="text-[19px] font-bold tracking-tight">{t("superAdmin.title")}</h1>
            <span className="inline-flex rounded-full bg-info-soft px-2.5 py-1.5 text-[10px] font-extrabold text-info-text">
              {t("superAdmin.settlementPill")}
            </span>
          </div>

          <div className="overflow-auto">
            <table className="w-full min-w-[620px] text-start text-sm">
              <thead>
                <tr className="border-b border-line text-[10px] font-bold text-muted-2">
                  <th className="px-2.5 py-3.5 text-start">{t("superAdmin.merchant")}</th>
                  <th className="px-2.5 py-3.5 text-start">{t("superAdmin.completed")}</th>
                  <th className="px-2.5 py-3.5 text-start">{t("superAdmin.collected")}</th>
                  <th className="px-2.5 py-3.5 text-start">{t("superAdmin.commission")}</th>
                  <th className="px-2.5 py-3.5 text-start">{t("superAdmin.owed")}</th>
                </tr>
              </thead>
              <tbody>
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
                      {row.owed.toLocaleString()} {t("common.egp")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="rounded-[22px] bg-[#101828] p-[22px] text-white">
          <div className="mb-1.5 text-[28px]">⚡</div>
          <h3 className="mb-1.5 text-base font-extrabold">{t("superAdmin.adminControlsTitle")}</h3>
          <p className="text-[11px] leading-relaxed text-[#98a2b3]">
            {t("superAdmin.adminControlsDesc")}
          </p>
          <button
            type="button"
            className="mt-2.5 w-full rounded-xl bg-white px-4 py-[11px] text-xs font-black text-[#101828] transition hover:brightness-95"
          >
            {t("superAdmin.emergencyCancel")}
          </button>
        </aside>
      </div>
    </div>
  );
}

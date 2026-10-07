import { getTranslations, getLocale } from "next-intl/server";
import { merchantLedger } from "@/lib/mock-admin-ledger";
import { mockCategories } from "@/lib/mock-categories";
import { addCategoryAction } from "@/lib/actions/categories";

export default async function SuperAdminPage() {
  const t = await getTranslations();
  const locale = await getLocale();

  return (
    <div className="mx-auto max-w-[1180px] px-[22px] py-[30px]">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
        <div className="flex flex-col gap-4">
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

        <div className="rounded-[22px] border border-line bg-surface p-[22px] shadow-[var(--shadow-card)]">
          <h2 className="mb-3.5 text-[16px] font-bold tracking-tight">
            {t("superAdmin.categories.title")}
          </h2>

          <div className="flex flex-wrap gap-2">
            {mockCategories.map((cat) => (
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

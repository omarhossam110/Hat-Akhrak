import { getTranslations, getLocale } from "next-intl/server";
import type { MerchantLedgerRow } from "@/lib/mock-admin-ledger";
import type { MockDealCard } from "@/lib/mock-deals";
import type { Category } from "@/lib/types/database";

function BarRow({
  label,
  value,
  maxValue,
  valueLabel,
}: {
  label: string;
  value: number;
  maxValue: number;
  valueLabel: string;
}) {
  const pct = maxValue > 0 ? Math.max(4, Math.round((value / maxValue) * 100)) : 0;
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-[86px] shrink-0 truncate font-bold">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-soft">
        <span
          className="block h-full rounded-full bg-gradient-to-r from-brand to-brand-2"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-[86px] shrink-0 text-end font-sans font-bold text-muted">
        {valueLabel}
      </span>
    </div>
  );
}

export async function AdminAnalytics({
  ledger,
  deals,
  categories,
}: {
  ledger: MerchantLedgerRow[];
  deals: MockDealCard[];
  categories: Category[];
}) {
  const t = await getTranslations();
  const locale = await getLocale();
  const egp = t("common.egp");

  const totalCollected = ledger.reduce((sum, row) => sum + row.collected, 0);
  const totalCommission = ledger.reduce((sum, row) => sum + row.commission, 0);
  const totalCompletedDeals = ledger.reduce((sum, row) => sum + row.completedDeals, 0);

  const maxCollected = Math.max(...ledger.map((r) => r.collected), 1);

  const dealsByCategory = categories
    .map((cat) => ({
      label: locale === "ar" ? cat.name_ar : cat.name_en,
      count: deals.filter((d) => d.deal.category_id === cat.id).length,
    }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);
  const maxCategoryCount = Math.max(...dealsByCategory.map((r) => r.count), 1);

  return (
    <div className="rounded-[22px] border border-line bg-surface p-[22px] shadow-[var(--shadow-card)]">
      <h2 className="mb-3.5 text-[16px] font-bold tracking-tight">{t("superAdmin.analytics.title")}</h2>

      <div className="mb-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="rounded-xl bg-brand-soft p-3.5">
          <div className="text-[10px] font-bold text-brand-text-strong">
            {t("superAdmin.analytics.totalCollected")}
          </div>
          <div className="mt-1 font-sans text-base font-extrabold text-brand-text-strong">
            {totalCollected.toLocaleString()} {egp}
          </div>
        </div>
        <div className="rounded-xl bg-success-soft p-3.5">
          <div className="text-[10px] font-bold text-success">
            {t("superAdmin.analytics.totalCommission")}
          </div>
          <div className="mt-1 font-sans text-base font-extrabold text-success">
            {totalCommission.toLocaleString()} {egp}
          </div>
        </div>
        <div className="rounded-xl bg-info-soft p-3.5">
          <div className="text-[10px] font-bold text-info-text">
            {t("superAdmin.analytics.totalDeals")}
          </div>
          <div className="mt-1 font-sans text-base font-extrabold text-info-text">
            {totalCompletedDeals.toLocaleString()}
          </div>
        </div>
      </div>

      <h3 className="mb-2.5 text-xs font-bold text-muted">
        {t("superAdmin.analytics.collectedByMerchant")}
      </h3>
      <div className="mb-5 flex flex-col gap-2.5">
        {ledger.map((row) => (
          <BarRow
            key={row.merchantId}
            label={row.businessName}
            value={row.collected}
            maxValue={maxCollected}
            valueLabel={`${row.collected.toLocaleString()} ${egp}`}
          />
        ))}
      </div>

      <h3 className="mb-2.5 text-xs font-bold text-muted">
        {t("superAdmin.analytics.dealsByCategory")}
      </h3>
      <div className="flex flex-col gap-2.5">
        {dealsByCategory.length === 0 ? (
          <p className="text-xs text-muted">{t("superAdmin.analytics.noData")}</p>
        ) : (
          dealsByCategory.map((row) => (
            <BarRow
              key={row.label}
              label={row.label}
              value={row.count}
              maxValue={maxCategoryCount}
              valueLabel={t("superAdmin.analytics.dealsCount", { count: row.count })}
            />
          ))
        )}
      </div>
    </div>
  );
}

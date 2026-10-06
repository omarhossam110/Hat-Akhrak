"use client";

import { Fragment, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { MerchantDealRow } from "@/lib/mock-merchant-dashboard";

const STATUS_STYLES: Record<MerchantDealRow["status"], string> = {
  active: "bg-success-soft text-success",
  needs_stock: "bg-[#fffaeb] text-[#b54708]",
  paused: "bg-[#f2f4f7] text-[#475467]",
};

const OUTCOME_STYLES: Record<string, string> = {
  succeeded: "text-success",
  failed: "text-danger",
  active: "text-muted",
};

export function MerchantDealsTable({ rows }: { rows: MerchantDealRow[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const [openId, setOpenId] = useState<string | null>(null);

  const statusLabel = (status: MerchantDealRow["status"]) =>
    status === "active"
      ? t("merchantDashboard.statusActive")
      : status === "needs_stock"
        ? t("merchantDashboard.statusNeedsStock")
        : t("merchantDashboard.statusPaused");

  return (
    <div className="overflow-hidden rounded-[22px] border border-line bg-white shadow-[var(--shadow-card)]">
      <div className="overflow-auto">
        <table className="w-full min-w-[680px] text-start text-sm">
          <thead>
            <tr className="border-b border-line bg-paper text-xs font-bold text-muted">
              <th className="px-5 py-3.5 text-start">{t("merchantDashboard.product")}</th>
              <th className="px-5 py-3.5 text-start">{t("merchantDashboard.stock")}</th>
              <th className="px-5 py-3.5 text-start">{t("merchantDashboard.currentCycle")}</th>
              <th className="px-5 py-3.5 text-start">{t("merchantDashboard.status")}</th>
              <th className="px-5 py-3.5 text-start" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const title = locale === "ar" ? row.title_ar : row.title_en;
              const isOpen = openId === row.dealId;
              return (
                <Fragment key={row.dealId}>
                  <tr className="border-b border-line">
                    <td className="px-5 py-4 font-semibold">{title}</td>
                    <td className="px-5 py-4 font-sans">
                      {row.remainingStock} / {row.totalStock}
                    </td>
                    <td className="px-5 py-4 font-sans">
                      {row.currentTier
                        ? t("merchantDashboard.tier", {
                            number: row.currentCycleSold,
                            tier: row.currentTier,
                          })
                        : `${row.currentCycleSold}/${row.currentCycleStock} • ${t(
                            "merchantDashboard.noTier",
                          )}`}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold ${STATUS_STYLES[row.status]}`}
                      >
                        {statusLabel(row.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-end">
                      <button
                        type="button"
                        onClick={() => setOpenId(isOpen ? null : row.dealId)}
                        className="text-xs font-extrabold text-brand"
                      >
                        {t("merchantDashboard.history")} {isOpen ? "▴" : "▾"}
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="border-b border-line">
                      <td colSpan={5} className="bg-paper px-5 py-3">
                        <div className="space-y-1.5 rounded-[14px] bg-white p-3.5">
                          {row.history.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between border-b border-line py-1.5 text-xs last:border-0"
                            >
                              <span>{locale === "ar" ? item.label_ar : item.label_en}</span>
                              <span className={`font-bold ${OUTCOME_STYLES[item.outcome]}`}>
                                {item.outcome === "succeeded"
                                  ? t("merchantDashboard.cycleSucceeded")
                                  : item.outcome === "failed"
                                    ? t("merchantDashboard.cycleFailed")
                                    : t("merchantDashboard.cycleActive")}
                              </span>
                              <span className="font-sans">
                                {item.amount !== null ? `${item.amount} ${t("common.egp")}` : "—"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

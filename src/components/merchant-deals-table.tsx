"use client";

import { Fragment, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { MerchantDealRow } from "@/lib/mock-merchant-dashboard";
import { DealControls } from "@/components/deal-controls";

const STATUS_STYLES: Record<MerchantDealRow["status"], string> = {
  active: "bg-success-soft text-success",
  needs_stock: "bg-warning-soft text-warning",
  paused: "bg-neutral-soft text-neutral",
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

  const statusLabel = (row: MerchantDealRow) =>
    row.dealStatus === "cancelled"
      ? t("merchantDashboard.statusCancelled")
      : row.status === "active"
      ? t("merchantDashboard.statusActive")
      : row.status === "needs_stock"
        ? t("merchantDashboard.statusNeedsStock")
        : t("merchantDashboard.statusPaused");

  const cycleLabel = (row: MerchantDealRow) =>
    row.currentTier
      ? t("merchantDashboard.tier", { number: row.currentCycleSold, tier: row.currentTier })
      : `${row.currentCycleSold}/${row.currentCycleStock} • ${t("merchantDashboard.noTier")}`;

  const historyList = (row: MerchantDealRow) => (
    <div className="space-y-1.5 rounded-[14px] bg-surface p-3.5">
      {row.history.map((item) => (
        <div
          key={item.id}
          className="flex flex-wrap items-center justify-between gap-x-3 border-b border-line py-1.5 text-xs last:border-0"
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
  );

  return (
    <>
      {/* Phones: one card per deal (the 6-column table needs ~820px). */}
      <div className="flex flex-col gap-3 sm:hidden">
        {rows.map((row) => {
          const title = locale === "ar" ? row.title_ar : row.title_en;
          const isOpen = openId === row.dealId;
          return (
            <div
              key={row.dealId}
              className="rounded-[18px] border border-line bg-surface p-4 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-start justify-between gap-3">
                <b className="min-w-0 break-words text-sm">{title}</b>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${STATUS_STYLES[row.status]}`}
                >
                  {statusLabel(row)}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-muted">{t("merchantDashboard.stock")}</dt>
                  <dd className="font-sans font-bold">
                    {row.remainingStock} / {row.totalStock}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">{t("merchantDashboard.currentCycle")}</dt>
                  <dd className="font-sans font-bold">{cycleLabel(row)}</dd>
                </div>
              </dl>
              <div className="mt-3">
                <DealControls
                  dealId={row.dealId}
                  cancelled={row.dealStatus === "cancelled"}
                  cycleHeld={row.cycleHeld}
                  hasRunningDeposits={row.hasRunningDeposits}
                />
              </div>
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : row.dealId)}
                className="mt-3 text-xs font-extrabold text-brand"
              >
                {t("merchantDashboard.history")} {isOpen ? "▴" : "▾"}
              </button>
              {isOpen && <div className="mt-2 rounded-[14px] bg-paper p-2">{historyList(row)}</div>}
            </div>
          );
        })}
      </div>

    <div className="hidden overflow-hidden rounded-[22px] border border-line bg-surface shadow-[var(--shadow-card)] sm:block">
      <div className="overflow-auto">
        <table className="w-full min-w-[820px] text-start text-sm">
          <thead>
            <tr className="border-b border-line bg-paper text-xs font-bold text-muted">
              <th className="px-5 py-3.5 text-start">{t("merchantDashboard.product")}</th>
              <th className="px-5 py-3.5 text-start">{t("merchantDashboard.stock")}</th>
              <th className="px-5 py-3.5 text-start">{t("merchantDashboard.currentCycle")}</th>
              <th className="px-5 py-3.5 text-start">{t("merchantDashboard.status")}</th>
              <th className="px-5 py-3.5 text-start">{t("merchantDashboard.manage")}</th>
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
                        {statusLabel(row)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <DealControls
                        dealId={row.dealId}
                        cancelled={row.dealStatus === "cancelled"}
                        cycleHeld={row.cycleHeld}
                        hasRunningDeposits={row.hasRunningDeposits}
                      />
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
                      <td colSpan={6} className="bg-paper px-5 py-3">
                        <div className="space-y-1.5 rounded-[14px] bg-surface p-3.5">
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
    </>
  );
}

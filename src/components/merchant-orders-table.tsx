import { getTranslations, getLocale } from "next-intl/server";
import type { MerchantOrderRow } from "@/lib/actions/orders";
import { DeliverOrderButton } from "@/components/deliver-order-button";
import { RefusalForm } from "@/components/refusal-form";

const STATUS_LABEL: Record<string, string> = {
  awaiting_balance: "merchantDashboard.statusAwaitingBalance",
  balance_paid: "merchantDashboard.statusReadyToDeliver",
  delivered: "merchantDashboard.statusInspection",
  completed: "merchantDashboard.statusCompleted",
  disputed: "merchantDashboard.statusDisputed",
  refused_by_buyer: "merchantDashboard.statusRefused",
};

const STATUS_STYLE: Record<string, string> = {
  awaiting_balance: "bg-warning-soft text-warning",
  balance_paid: "bg-info-soft text-info-text",
  delivered: "bg-warning-soft text-warning",
  completed: "bg-success-soft text-success",
  disputed: "bg-danger-soft text-danger",
  refused_by_buyer: "bg-neutral-soft text-neutral",
};

/** Orders past the cycle stage, with the one action that's the merchant's:
 * confirm delivery once the customer has paid the balance. */
export async function MerchantOrdersTable({ rows }: { rows: MerchantOrderRow[] }) {
  const t = await getTranslations();
  const locale = await getLocale();

  return (
    <div className="overflow-x-auto rounded-[22px] border border-line bg-surface shadow-[var(--shadow-card)]">
      <table className="w-full min-w-[820px] text-start text-sm">
        <thead>
          <tr className="border-b border-line bg-paper text-xs font-bold text-muted">
            <th className="px-5 py-3.5 text-start">{t("orders.product")}</th>
            <th className="px-5 py-3.5 text-start">{t("merchantDashboard.colCustomer")}</th>
            <th className="px-5 py-3.5 text-start">{t("merchantDashboard.colUnits")}</th>
            <th className="px-5 py-3.5 text-start">{t("merchantDashboard.colDelivery")}</th>
            <th className="px-5 py-3.5 text-start">{t("orders.status")}</th>
            <th className="px-5 py-3.5 text-start">{t("orders.action")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-line last:border-0">
              <td className="px-5 py-4 font-semibold">
                {locale === "ar" ? row.dealTitle_ar : row.dealTitle_en}
              </td>
              <td className="px-5 py-4">{row.customerName}</td>
              <td className="px-5 py-4 font-sans">{row.units}</td>
              <td className="px-5 py-4 text-xs">
                {row.delivery ? (
                  <div className="flex flex-col gap-0.5" data-testid="delivery-details">
                    <b>{row.delivery.name}</b>
                    <a href={`tel:${row.delivery.phone}`} dir="ltr" className="w-fit font-sans text-brand">
                      {row.delivery.phone}
                    </a>
                    <span className="text-muted">
                      {row.delivery.governorate} — {row.delivery.city}
                    </span>
                    <span className="max-w-[220px] text-muted">{row.delivery.address}</span>
                  </div>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
              <td className="px-5 py-4">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold ${STATUS_STYLE[row.status]}`}
                >
                  {t(STATUS_LABEL[row.status])}
                </span>
              </td>
              <td className="px-5 py-4">
                {row.status === "balance_paid" ? (
                  <DeliverOrderButton orderId={row.id} />
                ) : row.status === "awaiting_balance" ? (
                  <RefusalForm orderId={row.id} />
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

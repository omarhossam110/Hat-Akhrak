import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { mockOrders } from "@/lib/mock-orders";
import type { OrderStatus } from "@/lib/types/database";

const STATUS_STYLES: Record<
  "running" | "delivered" | "refunded",
  string
> = {
  running: "bg-warning-soft text-warning",
  delivered: "bg-success-soft text-success",
  refunded: "bg-neutral-soft text-neutral",
};

function statusGroup(status: OrderStatus): "running" | "delivered" | "refunded" {
  if (status === "completed" || status === "delivered") return "delivered";
  if (status === "refunded") return "refunded";
  return "running";
}

export default async function OrdersPage() {
  const t = await getTranslations();
  const locale = await getLocale();

  return (
    <div className="mx-auto max-w-[1180px] px-[22px] py-[30px]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[22px] font-extrabold tracking-tight sm:text-[26px]">
          {t("orders.title")}
        </h1>
        {mockOrders.length > 0 && (
          <span className="rounded-full bg-info-soft px-3 py-1.5 text-xs font-extrabold text-info-text">
            {t("orders.ordersCount", { count: mockOrders.length })}
          </span>
        )}
      </div>

      {mockOrders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[22px] border border-line bg-surface px-6 py-16 text-center shadow-[var(--shadow-card)]">
          <span className="text-[44px]">🧾</span>
          <h2 className="text-base font-extrabold">{t("orders.emptyTitle")}</h2>
          <p className="max-w-[360px] text-sm text-muted">
            {t("orders.emptyDesc")}
          </p>
          <Link
            href="/deals"
            className="mt-2 rounded-xl bg-brand px-5 py-2.5 text-xs font-black text-[#151515] transition hover:brightness-95"
          >
            {t("orders.emptyCta")} →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[22px] border border-line bg-surface shadow-[var(--shadow-card)]">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-line bg-paper text-xs font-bold text-muted">
                <th className="px-5 py-3.5 text-start">{t("orders.product")}</th>
                <th className="px-5 py-3.5 text-start">{t("orders.status")}</th>
                <th className="px-5 py-3.5 text-start">{t("orders.amount")}</th>
                <th className="px-5 py-3.5 text-start">{t("orders.action")}</th>
              </tr>
            </thead>
            <tbody>
              {mockOrders.map((order) => {
                const group = statusGroup(order.status);
                const title =
                  locale === "ar" ? order.productTitle_ar : order.productTitle_en;
                const statusLabel =
                  group === "running"
                    ? t("orders.statusRunning")
                    : group === "delivered"
                      ? t("orders.statusDelivered")
                      : t("orders.statusRefunded");

                return (
                  <tr key={order.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-4 font-semibold">{title}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold ${STATUS_STYLES[group]}`}
                      >
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-sans font-bold">
                      {order.amount} {t("common.egp")}
                    </td>
                    <td className="px-5 py-4">
                      {group === "running" && (
                        <button
                          type="button"
                          className="rounded-lg border border-line px-3 py-1.5 text-[11px] font-bold text-ink transition hover:bg-paper"
                        >
                          {t("orders.actionCancel")}
                        </button>
                      )}
                      {group === "delivered" && (
                        <button
                          type="button"
                          className="rounded-lg border border-line px-3 py-1.5 text-[11px] font-bold text-ink transition hover:bg-paper"
                        >
                          {t("orders.actionInvoice")}
                        </button>
                      )}
                      {group === "refunded" && (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

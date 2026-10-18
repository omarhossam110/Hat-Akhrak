import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getMyOrders } from "@/lib/actions/orders";
import { getReferrals } from "@/lib/actions/referrals";
import { InviteFriends } from "@/components/invite-friends";
import { PayBalanceButton } from "@/components/pay-balance-button";
import { CancelOrderButton } from "@/components/cancel-order-button";
import { ComplaintForm } from "@/components/complaint-form";
import { getSession } from "@/lib/auth/session";
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
  if (status === "refunded" || status === "cancelled_by_buyer" || status === "refused_by_buyer")
    return "refunded";
  return "running";
}

export default async function OrdersPage() {
  const t = await getTranslations();
  const locale = await getLocale();

  const session = await getSession();
  if (!session) {
    redirect(`/${locale}/login?redirect=${encodeURIComponent("/orders")}`);
  }

  const orders = await getMyOrders();
  const referrals = await getReferrals();
  type Order = (typeof orders)[number];

  function view(order: Order) {
    const group = statusGroup(order.status);
    const title = locale === "ar" ? order.productTitle_ar : order.productTitle_en;
    const statusLabel =
      order.status === "disputed"
        ? t("orders.statusDisputed")
        : order.status === "refused_by_buyer"
          ? t("orders.statusRefused")
          : group === "running"
            ? t("orders.statusRunning")
            : group === "delivered"
              ? t("orders.statusDelivered")
              : order.status === "cancelled_by_buyer"
                ? t("orders.statusCancelled")
                : t("orders.statusRefunded");
    return { group, title, statusLabel };
  }

  // Shared by the phone cards and the desktop table.
  function actions(order: Order, group: ReturnType<typeof statusGroup>) {
    return (
      <>
        {/* Cancelling is only offered while the 24h window is open and the
            cycle isn't in its final-24h freeze (spec 3.5). */}
        {order.status === "deposit_paid" &&
          (order.canCancel ? (
            <CancelOrderButton orderId={order.id} />
          ) : (
            <span className="text-[10px] text-muted">{t("orders.cancelClosed")}</span>
          ))}
        {order.status === "awaiting_balance" && order.balanceDue !== undefined && (
          <PayBalanceButton orderId={order.id} amount={order.balanceDue} />
        )}
        {order.canReport && <ComplaintForm orderId={order.id} />}
        {order.status === "disputed" && (
          <span className="text-[10px] text-muted">{t("orders.disputeUnderReview")}</span>
        )}
        {group === "delivered" && order.invoiceUrl && (
          <a
            href={order.invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-line px-3 py-1.5 text-[11px] font-bold text-ink transition hover:bg-paper"
          >
            {t("orders.actionInvoice")}
          </a>
        )}
        {group === "refunded" && <span className="text-muted">—</span>}
      </>
    );
  }

  return (
    <div className="mx-auto max-w-[1180px] px-[22px] py-[30px]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[22px] font-extrabold tracking-tight sm:text-[26px]">
          {t("orders.title")}
        </h1>
        {orders.length > 0 && (
          <span className="rounded-full bg-info-soft px-3 py-1.5 text-xs font-extrabold text-info-text">
            {t("orders.ordersCount", { count: orders.length })}
          </span>
        )}
      </div>

      {orders.length === 0 ? (
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
        <>
          {/* Phones: one card per order (a 4-column table gets clipped there). */}
          <div className="flex flex-col gap-3 sm:hidden">
            {orders.map((order) => {
              const v = view(order);
              return (
                <div
                  key={order.id}
                  className="rounded-[18px] border border-line bg-surface p-4 shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <b className="min-w-0 break-words text-sm">{v.title}</b>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${STATUS_STYLES[v.group]}`}
                    >
                      {v.statusLabel}
                    </span>
                  </div>
                  <p className="mt-2 font-sans text-sm font-bold">
                    {order.amount} {t("common.egp")}
                  </p>
                  <div className="mt-3 flex flex-wrap items-start gap-2 empty:hidden">{actions(order, v.group)}</div>
                </div>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto rounded-[22px] border border-line bg-surface shadow-[var(--shadow-card)] sm:block">
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
                {orders.map((order) => {
                  const v = view(order);
                  return (
                    <tr key={order.id} className="border-b border-line last:border-0">
                      <td className="px-5 py-4 font-semibold">{v.title}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold ${STATUS_STYLES[v.group]}`}
                        >
                          {v.statusLabel}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-sans font-bold">
                        {order.amount} {t("common.egp")}
                      </td>
                      <td className="px-5 py-4">{actions(order, v.group)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {referrals && <InviteFriends program={referrals} />}
    </div>
  );
}

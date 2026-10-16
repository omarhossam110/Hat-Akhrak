"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { cancelOrderAction, type OrderActionState } from "@/lib/actions/orders";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-line px-3 py-1.5 text-[11px] font-bold text-ink transition hover:bg-paper disabled:opacity-60"
    >
      {label}
    </button>
  );
}

/** Cancel a deposit-stage order for a full refund. Asks first, since it can't be undone. */
export function CancelOrderButton({ orderId }: { orderId: string }) {
  const t = useTranslations();
  const initial: OrderActionState = undefined;
  const [state, formAction] = useActionState(cancelOrderAction.bind(null, orderId), initial);

  const known = ["cancel_window_passed", "cycle_frozen", "not_cancellable"];
  const message =
    state?.error === "rejected" && state.code && known.includes(state.code)
      ? t(`orders.cancelErrors.${state.code}` as "orders.cancelErrors.cycle_frozen")
      : state?.error
        ? t("orders.errorAction")
        : null;

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(t("orders.cancelConfirm"))) e.preventDefault();
      }}
      className="flex flex-col items-start gap-1"
    >
      <Submit label={t("orders.actionCancel")} />
      {message && <span className="text-[10px] font-bold text-danger">{message}</span>}
    </form>
  );
}

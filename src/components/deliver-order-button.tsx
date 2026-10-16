"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { deliverOrderAction, type OrderActionState } from "@/lib/actions/orders";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand px-3 py-1.5 text-[11px] font-black text-[#151515] transition hover:brightness-95 disabled:opacity-60"
    >
      {label}
    </button>
  );
}

/** Merchant confirms the item was handed over — starts the customer's 48h
 * inspection window. */
export function DeliverOrderButton({ orderId }: { orderId: string }) {
  const t = useTranslations();
  const initial: OrderActionState = undefined;
  const [state, formAction] = useActionState(deliverOrderAction.bind(null, orderId), initial);

  return (
    <form action={formAction} className="flex flex-col items-start gap-1">
      <Submit label={t("merchantDashboard.actionDelivered")} />
      {state?.error && (
        <span className="text-[10px] font-bold text-danger">
          {t("merchantDashboard.errorAction")}
        </span>
      )}
    </form>
  );
}

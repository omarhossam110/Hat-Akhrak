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
      <label className="text-[10px] font-bold text-muted">
        {t("merchantDashboard.invoicePhoto")}
        <input
          type="file"
          name="invoice"
          accept="image/jpeg,image/png,image/webp"
          className="mt-0.5 block w-full max-w-[190px] text-[10px] file:me-2 file:rounded-md file:border file:border-line file:bg-paper file:px-2 file:py-1 file:text-[10px] file:font-bold"
        />
      </label>
      <Submit label={t("merchantDashboard.actionDelivered")} />
      {state?.error && (
        <span className="text-[10px] font-bold text-danger">
          {state.code === "invalidImage"
            ? t("merchantDashboard.errorInvalidImage")
            : state.code === "imageTooLarge"
              ? t("merchantDashboard.errorImageTooLarge")
              : t("merchantDashboard.errorAction")}
        </span>
      )}
    </form>
  );
}

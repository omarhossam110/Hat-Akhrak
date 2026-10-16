"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { payBalanceAction, type OrderActionState } from "@/lib/actions/orders";

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

/** "Pay the rest" on an order whose cycle succeeded. Placeholder payment —
 * no gateway yet, the backend records it immediately. */
export function PayBalanceButton({ orderId, amount }: { orderId: string; amount: number }) {
  const t = useTranslations();
  const initial: OrderActionState = undefined;
  const [state, formAction] = useActionState(payBalanceAction.bind(null, orderId), initial);

  return (
    <form action={formAction} className="flex flex-col items-start gap-1">
      <Submit label={`${t("orders.actionPayBalance")} (${amount} ${t("common.egp")})`} />
      {state?.error && (
        <span className="text-[10px] font-bold text-danger">{t("orders.errorAction")}</span>
      )}
    </form>
  );
}

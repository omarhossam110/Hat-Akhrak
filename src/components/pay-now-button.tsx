"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { payDepositAction, type PayDepositState } from "@/lib/actions/orders";
import { trackMetaEvent } from "@/lib/meta-pixel";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-3.5 block w-full rounded-xl bg-brand px-4 py-[11px] text-center text-xs font-black text-[#151515] transition hover:brightness-95 disabled:opacity-60"
    >
      {label}
    </button>
  );
}

export function PayNowButton({
  dealId,
  cycleId,
  units,
  amount,
}: {
  dealId: string;
  cycleId: string;
  units: number;
  amount: number;
}) {
  const t = useTranslations();
  const initial: PayDepositState = undefined;
  const [state, formAction] = useActionState(payDepositAction, initial);

  return (
    <form
      action={formAction}
      onSubmit={() =>
        trackMetaEvent("Purchase", { content_ids: dealId, value: amount, currency: "EGP" })
      }
    >
      <input type="hidden" name="cycleId" value={cycleId} />
      <input type="hidden" name="units" value={units} />

      {state?.error && (
        <div className="mt-3.5 rounded-xl bg-danger-soft px-3.5 py-3 text-[11px] font-bold text-danger">
          {state.error === "notSignedIn" && t("payment.errorNotSignedIn")}
          {state.error === "generic" && t("payment.errorGeneric")}
          {state.error === "rejected" &&
            (state.code === "max_units"
              ? t("payment.errorMaxUnits")
              : state.code === "cycle_frozen"
                ? t("payment.errorFrozen")
                : state.code === "cycle_closed"
                  ? t("payment.errorClosed")
                  : state.code === "sold_out"
                    ? t("payment.errorSoldOut")
                    : t("payment.errorRejected"))}
        </div>
      )}

      {/* Placeholder until a real payment gateway (provider TBD) is wired
          up: submitting records the order directly instead of redirecting
          to that gateway's hosted checkout. */}
      <SubmitButton label={`${t("payment.payNow")} →`} />
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { recordPayoutAction, type PayoutState } from "@/lib/actions/ledger";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-9 rounded-lg bg-brand px-3 text-[11px] font-black text-[#151515] transition hover:brightness-95 disabled:opacity-60"
    >
      {label}
    </button>
  );
}

/** Record a manual bank transfer to a merchant (capped at what's owed). */
export function RecordPayoutForm({ merchantId, owed }: { merchantId: string; owed: number }) {
  const t = useTranslations();
  const initial: PayoutState = undefined;
  const [state, formAction] = useActionState(recordPayoutAction.bind(null, merchantId), initial);

  const message =
    state?.code === "exceeds_owed"
      ? t("superAdmin.payoutExceeds")
      : state?.error
        ? t("superAdmin.payoutError")
        : null;

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <div className="flex gap-1.5">
        <input
          type="number"
          name="amount"
          required
          min="0.01"
          step="0.01"
          max={owed}
          placeholder={t("superAdmin.payoutAmount")}
          aria-label={t("superAdmin.payoutAmount")}
          className="h-9 w-24 rounded-lg border border-line bg-surface px-2 text-[11px] outline-none focus:border-brand"
        />
        <input
          type="text"
          name="reference"
          required
          minLength={3}
          placeholder={t("superAdmin.payoutReference")}
          aria-label={t("superAdmin.payoutReference")}
          className="h-9 w-28 rounded-lg border border-line bg-surface px-2 text-[11px] outline-none focus:border-brand"
        />
        <Submit label={t("superAdmin.payoutRecord")} />
      </div>
      {message && <span className="text-[10px] font-bold text-danger">{message}</span>}
    </form>
  );
}

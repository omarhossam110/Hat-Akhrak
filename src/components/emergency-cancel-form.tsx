"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { emergencyCancelAction } from "@/lib/actions/disputes";
import type { ActionState } from "@/lib/backend/post-action";
import { ActionError } from "@/components/action-error";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2.5 w-full rounded-xl bg-white px-4 py-[11px] text-xs font-black text-[#101828] transition hover:brightness-95 disabled:opacity-60"
    >
      {label}
    </button>
  );
}

/** Super admin's emergency cancel: pick a deal, give a reason, every running deposit is refunded. */
export function EmergencyCancelForm({
  deals,
}: {
  deals: { id: string; title: string }[];
}) {
  const t = useTranslations();
  const initial: ActionState = undefined;
  const [state, formAction] = useActionState(emergencyCancelAction, initial);
  const field =
    "mt-2 w-full rounded-lg border border-[#344054] bg-[#1d2939] px-3 py-2 text-xs text-white outline-none focus:border-brand";

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(t("superAdmin.emergencyConfirm"))) e.preventDefault();
      }}
    >
      <select name="dealId" required defaultValue="" aria-label={t("superAdmin.emergencyDeal")} className={field}>
        <option value="" disabled>
          {t("superAdmin.emergencyDeal")}
        </option>
        {deals.map((d) => (
          <option key={d.id} value={d.id}>
            {d.title}
          </option>
        ))}
      </select>
      <textarea
        name="reason"
        required
        minLength={5}
        maxLength={500}
        rows={2}
        placeholder={t("superAdmin.emergencyReason")}
        aria-label={t("superAdmin.emergencyReason")}
        className={field}
      />
      <Submit label={t("superAdmin.emergencyCancel")} />
      <div className="mt-1.5 text-[#fda29b]">
        <ActionError state={state} ns="superAdmin" known={["deal_cancelled"]} />
      </div>
    </form>
  );
}

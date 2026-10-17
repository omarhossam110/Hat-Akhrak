"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { openComplaintAction } from "@/lib/actions/disputes";
import type { ActionState } from "@/lib/backend/post-action";
import { ActionError } from "@/components/action-error";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-8 rounded-lg bg-brand px-3 text-[11px] font-black text-[#151515] transition hover:brightness-95 disabled:opacity-60"
    >
      {label}
    </button>
  );
}

/** Customer reports a problem with an order (before paying the rest, or in the 48h inspection window). */
export function ComplaintForm({ orderId }: { orderId: string }) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const initial: ActionState = undefined;
  const [state, formAction] = useActionState(openComplaintAction.bind(null, orderId), initial);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-8 rounded-lg border border-line px-3 text-[11px] font-bold text-ink transition hover:bg-paper"
      >
        {t("orders.actionReport")}
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col items-start gap-1.5">
      <textarea
        name="description"
        required
        minLength={5}
        maxLength={1000}
        rows={2}
        placeholder={t("orders.reportPlaceholder")}
        aria-label={t("orders.reportPlaceholder")}
        className="w-[220px] rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[11px] outline-none focus:border-brand"
      />
      <div className="flex gap-1.5">
        <Submit label={t("orders.reportSend")} />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-8 rounded-lg border border-line px-3 text-[11px] font-bold"
        >
          {t("common.cancel")}
        </button>
      </div>
      <ActionError state={state} ns="disputes" known={["not_disputable", "inspection_closed"]} />
    </form>
  );
}

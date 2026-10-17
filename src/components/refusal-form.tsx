"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { reportRefusalAction } from "@/lib/actions/disputes";
import type { ActionState } from "@/lib/backend/post-action";
import { ActionError } from "@/components/action-error";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-8 rounded-lg bg-danger px-3 text-[11px] font-black text-white transition hover:brightness-95 disabled:opacity-60"
    >
      {label}
    </button>
  );
}

/** Merchant reports that the customer refused the order at delivery; the admin decides the money. */
export function RefusalForm({ orderId }: { orderId: string }) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const initial: ActionState = undefined;
  const [state, formAction] = useActionState(reportRefusalAction.bind(null, orderId), initial);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-8 rounded-lg border border-line px-3 text-[11px] font-bold text-danger transition hover:bg-paper"
      >
        {t("merchantDashboard.actionRefused")}
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col items-start gap-1.5">
      <input
        type="text"
        name="note"
        required
        minLength={3}
        maxLength={1000}
        placeholder={t("merchantDashboard.refusalNote")}
        aria-label={t("merchantDashboard.refusalNote")}
        className="h-8 w-[200px] rounded-lg border border-line bg-surface px-2.5 text-[11px] outline-none focus:border-brand"
      />
      <div className="flex gap-1.5">
        <Submit label={t("merchantDashboard.refusalSend")} />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-8 rounded-lg border border-line px-3 text-[11px] font-bold"
        >
          {t("common.cancel")}
        </button>
      </div>
      <ActionError state={state} ns="disputes" known={["not_disputable"]} />
    </form>
  );
}

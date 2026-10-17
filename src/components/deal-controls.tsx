"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { cancelDealAction, restockDealAction } from "@/lib/actions/merchant-deals";
import type { ActionState } from "@/lib/backend/post-action";
import { ActionError } from "@/components/action-error";

function Submit({ label, tone }: { label: string; tone: "brand" | "plain" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        tone === "brand"
          ? "h-8 rounded-lg bg-brand px-3 text-[11px] font-black text-[#151515] transition hover:brightness-95 disabled:opacity-60"
          : "h-8 rounded-lg border border-line px-3 text-[11px] font-bold text-ink transition hover:bg-paper disabled:opacity-60"
      }
    >
      {label}
    </button>
  );
}

const KNOWN = ["invalid_units", "deal_cancelled", "has_active_deposits"];
const initial: ActionState = undefined;

/** Merchant's per-deal controls: add stock (so a held cycle can resume) and cancel the deal. */
export function DealControls({
  dealId,
  cancelled,
  cycleHeld,
  hasRunningDeposits,
}: {
  dealId: string;
  cancelled: boolean;
  cycleHeld: boolean;
  hasRunningDeposits: boolean;
}) {
  const t = useTranslations();
  const [restockState, restockAction] = useActionState(restockDealAction.bind(null, dealId), initial);
  const [cancelState, cancelAction] = useActionState(cancelDealAction.bind(null, dealId), initial);

  if (cancelled) {
    return <span className="text-[11px] font-bold text-muted">{t("merchantDashboard.statusCancelled")}</span>;
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <form action={restockAction} className="flex items-center gap-1.5">
        <input
          type="number"
          name="units"
          min={5}
          max={200}
          step={5}
          defaultValue={cycleHeld ? 20 : 5}
          required
          aria-label={t("merchantDashboard.restockUnits")}
          className="h-8 w-16 rounded-lg border border-line bg-surface px-2 text-center font-sans text-[11px] outline-none focus:border-brand"
        />
        <Submit tone="brand" label={t("merchantDashboard.restock")} />
      </form>
      <ActionError state={restockState} ns="merchantDashboard" known={KNOWN} />

      <form
        action={cancelAction}
        onSubmit={(e) => {
          if (!window.confirm(t("merchantDashboard.cancelDealConfirm"))) e.preventDefault();
        }}
        className="flex flex-col items-end gap-1"
      >
        {hasRunningDeposits ? (
          <>
            <button
              type="button"
              disabled
              className="h-8 cursor-not-allowed rounded-lg border border-line px-3 text-[11px] font-bold text-muted opacity-60"
            >
              {t("merchantDashboard.cancelDeal")}
            </button>
            <span className="max-w-[200px] text-end text-[10px] text-muted">
              {t("merchantDashboard.cancelBlocked")}
            </span>
          </>
        ) : (
          <Submit tone="plain" label={t("merchantDashboard.cancelDeal")} />
        )}
      </form>
      <ActionError state={cancelState} ns="merchantDashboard" known={KNOWN} />
    </div>
  );
}

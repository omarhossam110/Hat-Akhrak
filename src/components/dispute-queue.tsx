"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { resolveDisputeAction, type DisputeRow } from "@/lib/actions/disputes";
import type { ActionState } from "@/lib/backend/post-action";
import { ActionError } from "@/components/action-error";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-9 rounded-lg bg-brand px-4 text-[11px] font-black text-[#151515] transition hover:brightness-95 disabled:opacity-60"
    >
      {label}
    </button>
  );
}

function ResolveForm({ dispute }: { dispute: DisputeRow }) {
  const t = useTranslations();
  const initial: ActionState = undefined;
  const [state, formAction] = useActionState(resolveDisputeAction.bind(null, dispute.id), initial);
  const field =
    "h-9 w-28 rounded-lg border border-line bg-surface px-2.5 font-sans text-[11px] outline-none focus:border-brand";

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(t("disputes.confirm"))) e.preventDefault();
      }}
      className="mt-3 flex flex-col gap-2.5 border-t border-line pt-3"
    >
      <fieldset className="flex flex-wrap gap-4 text-xs">
        <label className="flex items-center gap-1.5">
          <input type="radio" name="fault" value="customer_at_fault" required />
          {t("disputes.customerAtFault")}
        </label>
        <label className="flex items-center gap-1.5">
          <input type="radio" name="fault" value="merchant_at_fault" required />
          {t("disputes.merchantAtFault")}
        </label>
      </fieldset>
      <div className="flex flex-wrap items-end gap-2.5">
        <label className="flex flex-col gap-1 text-[10px] font-bold text-muted">
          {t("disputes.shippingCost")}
          <input type="number" name="shippingCost" min={0} step="0.01" defaultValue={0} required className={field} />
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-bold text-muted">
          {t("disputes.returnCost")}
          <input type="number" name="returnCost" min={0} step="0.01" defaultValue={0} required className={field} />
        </label>
        <Submit label={t("disputes.resolve")} />
      </div>
      <p className="text-[10px] text-muted">{t("disputes.rulesHint")}</p>
      <ActionError state={state} ns="disputes" known={["already_resolved"]} />
    </form>
  );
}

export function DisputeQueue({ disputes }: { disputes: DisputeRow[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const open = disputes.filter((d) => d.status === "open");
  const resolved = disputes.filter((d) => d.status === "resolved").slice(0, 5);

  if (disputes.length === 0) {
    return <p className="text-xs text-muted">{t("disputes.empty")}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {open.map((d) => (
        <div key={d.id} data-testid="dispute-open" className="rounded-xl border border-line p-3.5 text-xs">
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <b className="text-[13px]">{d.dealTitle}</b>
            <span className="rounded-full bg-warning-soft px-2.5 py-1 text-[10px] font-extrabold text-warning">
              {d.kind === "refusal" ? t("disputes.kindRefusal") : t("disputes.kindComplaint")}
            </span>
          </div>
          <p className="text-muted">
            {d.customerName} ↔ {d.merchantName} • {d.units} × {d.finalUnitPrice ?? "—"} {t("common.egp")} •{" "}
            {t("disputes.deposit")}: {d.depositAmount} {t("common.egp")}
          </p>
          <p className="mt-1.5 rounded-lg bg-paper p-2.5">
            {d.openedByRole === "merchant" ? t("disputes.byMerchant") : t("disputes.byCustomer")}: {d.description}
          </p>
          <ResolveForm dispute={d} />
        </div>
      ))}
      {open.length === 0 && <p className="text-xs text-muted">{t("disputes.noneOpen")}</p>}
      {resolved.length > 0 && (
        <div className="border-t border-line pt-3">
          <h3 className="mb-2 text-[11px] font-bold text-muted">{t("disputes.recentlyResolved")}</h3>
          {resolved.map((d) => (
            <div key={d.id} className="flex flex-wrap justify-between gap-2 py-1 text-[11px]">
              <span>{d.dealTitle}</span>
              <span className="text-muted">
                {d.resolution === "merchant_at_fault" ? t("disputes.merchantAtFault") : t("disputes.customerAtFault")}
                {" • "}
                {Number(d.refundAmount ?? 0).toLocaleString(locale)} {t("common.egp")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

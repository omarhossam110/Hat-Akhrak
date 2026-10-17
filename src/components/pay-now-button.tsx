"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { payDepositAction, type PayDepositState } from "@/lib/actions/orders";
import { trackMetaEvent } from "@/lib/meta-pixel";
import { GOVERNORATES } from "@/lib/egypt-governorates";
import type { DeliveryDetails } from "@/lib/actions/orders";

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
  defaults,
}: {
  dealId: string;
  cycleId: string;
  units: number;
  amount: number;
  defaults: DeliveryDetails;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const input =
    "h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-xs outline-none transition focus:border-brand";
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

      <fieldset className="mt-4 flex flex-col gap-2.5">
        <legend className="mb-1 text-xs font-extrabold text-ink">{t("payment.deliveryTitle")}</legend>
        <p className="text-[11px] text-muted">{t("payment.deliveryNote")}</p>
        <input name="deliveryName" required minLength={2} maxLength={100} defaultValue={defaults.name}
          placeholder={t("payment.deliveryName")} aria-label={t("payment.deliveryName")} className={input} />
        <input name="deliveryPhone" type="tel" inputMode="tel" required defaultValue={defaults.phone}
          pattern="(\+20|0020|0)?1[0125][0-9\s\-]{8,12}" title={t("payment.deliveryPhoneHint")}
          placeholder={t("payment.deliveryPhone")} aria-label={t("payment.deliveryPhone")} className={`${input} font-sans`} dir="ltr" />
        <div className="grid grid-cols-2 gap-2.5">
          <select name="deliveryGovernorate" required defaultValue={defaults.governorate}
            aria-label={t("payment.deliveryGovernorate")} className={input}>
            <option value="" disabled>{t("payment.deliveryGovernorate")}</option>
            {GOVERNORATES.map((g) => (
              <option key={g.value} value={g.value}>{locale === "ar" ? g.value : g.en}</option>
            ))}
          </select>
          <input name="deliveryCity" required minLength={2} maxLength={80} defaultValue={defaults.city}
            placeholder={t("payment.deliveryCity")} aria-label={t("payment.deliveryCity")} className={input} />
        </div>
        <textarea name="deliveryAddress" required minLength={5} maxLength={300} rows={2} defaultValue={defaults.address}
          placeholder={t("payment.deliveryAddress")} aria-label={t("payment.deliveryAddress")}
          className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-xs outline-none transition focus:border-brand" />
      </fieldset>

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

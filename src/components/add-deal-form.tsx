"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations, useLocale } from "next-intl";
import { createDealAction, type AddDealFormState } from "@/lib/actions/deals";
import type { Category } from "@/lib/types/database";

/**
 * Illustrative-only preview — the real tier prices are computed
 * server-side from the take-rate matrix (hat-akhrak-backend's
 * src/modules/deals/pricing.ts) once the form is submitted. This mirrors
 * that formula's *shape* (a margin on top of wholesale price) just closely
 * enough to show the merchant a ballpark while typing, not the final
 * number.
 */
function estimateDeposit(wholesalePrice: number) {
  if (!wholesalePrice || wholesalePrice <= 0) return 0;
  return Math.max(20, Math.round((wholesalePrice * 0.15) / 5) * 5);
}

const ALLOWED_TOTAL_STOCK = [5, 10, 15, 20];

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="block w-full rounded-xl bg-brand px-4 py-[11px] text-center text-xs font-black text-[#151515] transition hover:brightness-95 disabled:opacity-60"
    >
      {label}
    </button>
  );
}

export function AddDealForm({ categories }: { categories: Category[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [totalStock, setTotalStock] = useState("");

  const initialState: AddDealFormState = undefined;
  const [state, formAction] = useActionState(createDealAction, initialState);

  const priceNumber = Number(wholesalePrice) || 0;
  const stockNumber = Number(totalStock) || 0;
  const stockInvalid = totalStock !== "" && !ALLOWED_TOTAL_STOCK.includes(stockNumber);
  const suggestedDeposit = useMemo(() => estimateDeposit(priceNumber), [priceNumber]);

  const errorKey = state?.error
    ? ({ notVerified: "errorNotVerified", validation: "errorValidation", generic: "errorGeneric" } as const)[
        state.error
      ]
    : undefined;

  return (
    <form
      action={formAction}
      className="max-w-[620px] rounded-[22px] border border-line bg-surface p-[22px] shadow-[var(--shadow-card)]"
    >
      <div className="mb-1.5 text-xs font-extrabold uppercase tracking-wide text-brand">
        {t("addDeal.eyebrow")}
      </div>
      <h1 className="mb-1.5 text-[26px] font-extrabold tracking-tight">{t("addDeal.title")}</h1>
      <p className="mb-5 text-xs leading-relaxed text-muted">{t("addDeal.desc")}</p>

      {errorKey && (
        <div className="mb-3.5 rounded-xl bg-danger-soft px-3.5 py-3 text-[11px] font-bold text-danger">
          {t(`addDeal.${errorKey}`)}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className="mb-1.5 block text-[11px] font-extrabold text-neutral">
            {t("addDeal.fieldProductName")}
          </label>
          <input
            id="title"
            name="title"
            required
            className="h-11 w-full rounded-xl border border-line px-3 outline-none focus:border-focus-border focus:shadow-[0_0_0_3px_var(--color-focus-ring)]"
            placeholder="..."
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="categoryId" className="mb-1.5 block text-[11px] font-extrabold text-neutral">
            {t("addDeal.fieldCategory")}
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue=""
            className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-xs font-bold outline-none focus:border-focus-border focus:shadow-[0_0_0_3px_var(--color-focus-ring)]"
          >
            <option value="">{t("addDeal.categoryPlaceholder")}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {locale === "ar" ? cat.name_ar : cat.name_en}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="totalStock" className="mb-1.5 block text-[11px] font-extrabold text-neutral">
            {t("addDeal.fieldTotalStock")}
          </label>
          <select
            id="totalStock"
            name="totalStock"
            value={totalStock}
            onChange={(e) => setTotalStock(e.target.value)}
            required
            className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-xs font-bold outline-none focus:border-focus-border focus:shadow-[0_0_0_3px_var(--color-focus-ring)]"
          >
            <option value="" disabled>
              ...
            </option>
            {ALLOWED_TOTAL_STOCK.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {stockInvalid && (
            <p className="mt-1.5 text-[11px] font-bold text-danger">{t("addDeal.stockHint")}</p>
          )}
        </div>
        <div>
          <label htmlFor="wholesalePrice" className="mb-1.5 block text-[11px] font-extrabold text-neutral">
            {t("addDeal.fieldWholesalePrice")}
          </label>
          <input
            id="wholesalePrice"
            name="wholesaleUnitPrice"
            type="number"
            min={0}
            step="0.01"
            required
            value={wholesalePrice}
            onChange={(e) => setWholesalePrice(e.target.value)}
            className="h-11 w-full rounded-xl border border-line px-3 outline-none focus:border-focus-border focus:shadow-[0_0_0_3px_var(--color-focus-ring)]"
            placeholder={t("common.egp") === "جنيه" ? "600 جنيه" : "EGP 600"}
          />
        </div>
      </div>

      <div className="my-3.5 rounded-xl bg-success-soft p-3 text-[11px] text-success">
        ✓ {t("addDeal.autoNote", { amount: suggestedDeposit || "—" })}
      </div>

      <SubmitButton label={`${t("addDeal.publishBtn")} →`} />
    </form>
  );
}

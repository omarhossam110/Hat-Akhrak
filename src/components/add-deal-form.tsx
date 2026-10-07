"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

/**
 * Illustrative deposit formula (final formula/provider fees still TBD per
 * the spec — real calculation will live server-side once a payment
 * gateway is connected): a flat share of wholesale price, rounded to the
 * nearest 5 EGP, covering potential refusal costs (shipping + return +
 * admin fee).
 */
function estimateDeposit(wholesalePrice: number) {
  if (!wholesalePrice || wholesalePrice <= 0) return 0;
  return Math.max(20, Math.round((wholesalePrice * 0.15) / 5) * 5);
}

export function AddDealForm() {
  const t = useTranslations();
  const router = useRouter();
  const [productName, setProductName] = useState("");
  const [totalStock, setTotalStock] = useState("");
  const [wholesalePrice, setWholesalePrice] = useState("");

  const stockNumber = Number(totalStock) || 0;
  const priceNumber = Number(wholesalePrice) || 0;
  const stockInvalid = stockNumber > 0 && stockNumber % 5 !== 0;
  const suggestedDeposit = useMemo(() => estimateDeposit(priceNumber), [priceNumber]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (stockInvalid) return;
    router.push("/merchant/dashboard"); // placeholder until real Supabase insert is wired
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[620px] rounded-[22px] border border-line bg-surface p-[22px] shadow-[var(--shadow-card)]">
      <div className="mb-1.5 text-xs font-extrabold uppercase tracking-wide text-brand">
        {t("addDeal.eyebrow")}
      </div>
      <h1 className="mb-1.5 text-[26px] font-extrabold tracking-tight">{t("addDeal.title")}</h1>
      <p className="mb-5 text-xs leading-relaxed text-muted">{t("addDeal.desc")}</p>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="productName" className="mb-1.5 block text-[11px] font-extrabold text-neutral">
            {t("addDeal.fieldProductName")}
          </label>
          <input
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="h-11 w-full rounded-xl border border-line px-3 outline-none focus:border-focus-border focus:shadow-[0_0_0_3px_var(--color-focus-ring)]"
            placeholder="..."
          />
        </div>
        <div>
          <label htmlFor="totalStock" className="mb-1.5 block text-[11px] font-extrabold text-neutral">
            {t("addDeal.fieldTotalStock")}
          </label>
          <input
            id="totalStock"
            type="number"
            min={5}
            step={5}
            value={totalStock}
            onChange={(e) => setTotalStock(e.target.value)}
            className="h-11 w-full rounded-xl border border-line px-3 outline-none focus:border-focus-border focus:shadow-[0_0_0_3px_var(--color-focus-ring)]"
            placeholder="200"
          />
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
            type="number"
            min={0}
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

      <button
        type="submit"
        className="block w-full rounded-xl bg-brand px-4 py-[11px] text-center text-xs font-black text-[#151515] transition hover:brightness-95"
      >
        {t("addDeal.publishBtn")} →
      </button>
    </form>
  );
}

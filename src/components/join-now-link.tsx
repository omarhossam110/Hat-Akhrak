"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { trackMetaEvent } from "@/lib/meta-pixel";

/** Quantity picker + the "Join now" CTA on a deal. The chosen quantity
 * travels to the payment page as ?qty=, and a guest is sent through signup
 * first and brought back to that exact payment URL. Tracks InitiateCheckout
 * before navigating. */
export function JoinNowLink({
  basePath,
  signedIn,
  dealId,
  depositAmount,
  maxQty,
  quantityLabel,
  children,
}: {
  basePath: string;
  signedIn: boolean;
  dealId: string;
  depositAmount: number;
  maxQty: number;
  quantityLabel: string;
  children: React.ReactNode;
}) {
  const [qty, setQty] = useState(1);
  const paymentUrl = `${basePath}?qty=${qty}`;
  const href = signedIn
    ? paymentUrl
    : `/signup?redirect=${encodeURIComponent(paymentUrl)}`;

  return (
    <>
      <label className="sr-only" htmlFor="qty">
        {quantityLabel}
      </label>
      <select
        id="qty"
        value={qty}
        onChange={(e) => setQty(Number(e.target.value))}
        className="mb-2.5 w-full rounded-xl border border-line bg-surface p-[11px] outline-none"
      >
        {Array.from({ length: Math.max(1, maxQty) }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <Link
        href={href}
        onClick={() =>
          trackMetaEvent("InitiateCheckout", {
            content_ids: dealId,
            value: Number((depositAmount * qty).toFixed(2)),
            currency: "EGP",
          })
        }
        className="block w-full rounded-xl bg-brand px-4 py-[11px] text-center text-xs font-black text-[#151515] transition hover:brightness-95"
      >
        {children}
      </Link>
    </>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { trackMetaEvent } from "@/lib/meta-pixel";

export function PayNowButton({
  dealId,
  amount,
}: {
  dealId: string;
  amount: number;
}) {
  const t = useTranslations();
  const router = useRouter();

  function handleClick() {
    trackMetaEvent("Purchase", { content_ids: dealId, value: amount, currency: "EGP" });
    // Placeholder until a real payment gateway (provider TBD) is wired up:
    // this will redirect to that gateway's hosted checkout instead.
    router.push("/orders");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mt-3.5 block w-full rounded-xl bg-brand px-4 py-[11px] text-center text-xs font-black text-[#151515] transition hover:brightness-95"
    >
      {t("payment.payNow")} →
    </button>
  );
}

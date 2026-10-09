"use client";

import { Link } from "@/i18n/navigation";
import { trackMetaEvent } from "@/lib/meta-pixel";

/** The "Join now" CTA on a deal — tracks InitiateCheckout before navigating. */
export function JoinNowLink({
  href,
  dealId,
  value,
  children,
}: {
  href: string;
  dealId: string;
  value: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={() =>
        trackMetaEvent("InitiateCheckout", {
          content_ids: dealId,
          value,
          currency: "EGP",
        })
      }
      className="block w-full rounded-xl bg-brand px-4 py-[11px] text-center text-xs font-black text-[#151515] transition hover:brightness-95"
    >
      {children}
    </Link>
  );
}

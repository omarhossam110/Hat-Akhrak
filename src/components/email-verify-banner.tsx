"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { resendVerificationAction, type ResendState } from "@/lib/actions/verify-email";

/** Shown under the header to signed-in people who haven't confirmed their email yet. */
export function EmailVerifyBanner() {
  const t = useTranslations("verifyEmail");
  const [result, setResult] = useState<ResendState>();
  const [pending, start] = useTransition();

  return (
    <div className="border-b border-line bg-warning-soft px-[22px] py-2.5 text-center text-[11px] font-bold text-warning">
      {result === "already" ? (
        t("bannerAlready")
      ) : (
        <>
          {t("banner")}{" "}
          {result === "sent" ? (
            <span>{t("bannerSent")}</span>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => start(async () => setResult(await resendVerificationAction()))}
              className="underline disabled:opacity-60"
            >
              {t("bannerResend")}
            </button>
          )}
          {result === "error" && <span className="ms-2 text-danger">{t("generic")}</span>}
        </>
      )}
    </div>
  );
}

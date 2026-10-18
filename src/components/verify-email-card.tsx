"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { verifyEmailAction, type VerifyState } from "@/lib/actions/verify-email";

export function VerifyEmailCard({ token }: { token: string }) {
  const t = useTranslations("verifyEmail");
  const [state, setState] = useState<VerifyState>();
  const [pending, start] = useTransition();

  return (
    <div className="mx-auto max-w-[420px] rounded-[22px] border border-line bg-surface p-[22px] text-center shadow-[var(--shadow-card)]">
      {state && "done" in state ? (
        <>
          <div className="mb-3 text-[36px]">✅</div>
          <p className="text-sm leading-relaxed text-muted">{t("success")}</p>
          <Link
            href="/deals"
            className="mt-5 inline-block rounded-xl bg-brand px-5 py-2.5 text-xs font-black text-[#151515] transition hover:brightness-95"
          >
            {t("continue")} →
          </Link>
        </>
      ) : (
        <>
          <h1 className="mb-1.5 text-[20px] font-extrabold tracking-tight">{t("title")}</h1>
          <p className="mb-5 text-xs leading-relaxed text-muted">{t("desc")}</p>
          {state && "error" in state && (
            <p className="mb-3 rounded-xl bg-danger-soft p-3 text-[11px] font-bold text-danger">
              {state.error === "invalid" ? t("invalid") : t("generic")}
            </p>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() => start(async () => setState(await verifyEmailAction(token)))}
            className="rounded-xl bg-brand px-5 py-2.5 text-xs font-black text-[#151515] transition hover:brightness-95 disabled:opacity-60"
          >
            {t("confirm")}
          </button>
        </>
      )}
    </div>
  );
}

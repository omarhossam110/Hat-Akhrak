"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { useFormStatus } from "react-dom";
import { Link } from "@/i18n/navigation";
import { forgotPasswordAction } from "@/lib/actions/auth";

export function ForgotPasswordForm() {
  const t = useTranslations();
  const [state, formAction] = useActionState(forgotPasswordAction, undefined);

  if (state?.sent) {
    return (
      <div className="mx-auto max-w-[420px] rounded-[22px] border border-line bg-surface p-[22px] text-center shadow-[var(--shadow-card)]">
        <div className="mb-3 text-[36px]">✉️</div>
        <p className="text-sm leading-relaxed text-muted">
          {t("forgotPassword.successMessage")}
        </p>
        <Link
          href="/login"
          className="mt-5 inline-block rounded-xl bg-brand px-5 py-2.5 text-xs font-black text-[#151515] transition hover:brightness-95"
        >
          {t("forgotPassword.backToLogin")} →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[420px]">
      <div className="rounded-[22px] border border-line bg-surface p-[22px] shadow-[var(--shadow-card)]">
        <h1 className="mb-1.5 text-[20px] font-extrabold tracking-tight">
          {t("forgotPassword.title")}
        </h1>
        <p className="mb-5 text-xs leading-relaxed text-muted">{t("forgotPassword.desc")}</p>

        <form action={formAction}>
          <div className="mb-3">
            <label
              htmlFor="email"
              className="mb-1.5 block text-[11px] font-extrabold text-neutral"
            >
              {t("auth.email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="h-11 w-full rounded-xl border border-line px-3 outline-none transition focus:border-focus-border focus:shadow-[0_0_0_3px_var(--color-focus-ring)]"
            />
          </div>

          {state?.error && (
            <p className="mb-3 rounded-xl bg-danger-soft p-2.5 text-[11px] font-bold text-danger">
              {t(`auth.${state.error}` as "auth.errorGeneric")}
            </p>
          )}

          <SubmitButton label={t("forgotPassword.submitBtn")} />
        </form>
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        <Link href="/login" className="font-extrabold text-brand">
          {t("forgotPassword.backToLogin")} →
        </Link>
      </p>
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-brand px-4 py-[11px] text-center text-xs font-black text-[#151515] transition hover:brightness-95 disabled:opacity-60"
    >
      {label} →
    </button>
  );
}

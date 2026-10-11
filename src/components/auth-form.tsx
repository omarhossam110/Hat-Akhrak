"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { useFormStatus } from "react-dom";
import { Link } from "@/i18n/navigation";
import { loginAction, signupAction, type AuthFormState } from "@/lib/actions/auth";

export function AuthForm({
  mode,
  redirectTo,
  referralCode,
}: {
  mode: "login" | "signup";
  redirectTo?: string;
  referralCode?: string;
}) {
  const t = useTranslations();
  const isSignup = mode === "signup";

  const action = isSignup
    ? signupAction.bind(null, redirectTo, referralCode)
    : loginAction.bind(null, redirectTo);
  const [state, formAction] = useActionState<AuthFormState, FormData>(action, undefined);

  const query = redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : "";

  return (
    <div className="mx-auto max-w-[420px]">
      {redirectTo && (
        <div className="mb-[18px] flex items-start gap-2.5 rounded-[13px] bg-info-soft p-3.5 text-[11px] leading-relaxed text-info-text">
          {t("auth.guestNote")}
        </div>
      )}

      {isSignup && referralCode && (
        <div className="mb-[18px] flex items-start gap-2.5 rounded-[13px] bg-brand-soft p-3.5 text-[11px] leading-relaxed text-brand-text-strong">
          🎁 {t("auth.referralBanner", { code: referralCode })}
        </div>
      )}

      <div className="rounded-[22px] border border-line bg-surface p-[22px] shadow-[var(--shadow-card)]">
        <div className="mb-5 flex gap-1.5 rounded-[13px] bg-neutral-soft p-1.5">
          <Link
            href={`/login${query}`}
            className={`flex-1 rounded-[9px] p-2.5 text-center text-xs font-extrabold transition ${
              !isSignup
                ? "bg-surface text-ink shadow-[0_3px_10px_rgba(16,24,40,0.08)]"
                : "text-muted"
            }`}
          >
            {t("auth.login")}
          </Link>
          <Link
            href={`/signup${query}`}
            className={`flex-1 rounded-[9px] p-2.5 text-center text-xs font-extrabold transition ${
              isSignup
                ? "bg-surface text-ink shadow-[0_3px_10px_rgba(16,24,40,0.08)]"
                : "text-muted"
            }`}
          >
            {t("auth.signup")}
          </Link>
        </div>

        <form action={formAction}>
          {isSignup && <Field label={t("auth.name")} type="text" name="name" />}
          <Field label={t("auth.email")} type="email" name="email" />
          {isSignup && (
            <Field label={t("auth.phone")} type="tel" name="phone" required={false} />
          )}
          <Field label={t("auth.password")} type="password" name="password" />

          {!isSignup && (
            <div className="mb-3 text-end">
              <Link href="/forgot-password" className="text-[11px] font-bold text-brand">
                {t("auth.forgotPasswordLink")}
              </Link>
            </div>
          )}

          {state?.error && (
            <p className="mb-3 rounded-xl bg-danger-soft p-2.5 text-[11px] font-bold text-danger">
              {t(`auth.${state.error}` as "auth.errorGeneric")}
            </p>
          )}

          <SubmitButton label={isSignup ? t("auth.signupBtn") : t("auth.loginBtn")} />
        </form>
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        {t("auth.merchantCta")}{" "}
        <Link href="/merchant/signup" className="font-extrabold text-brand">
          {t("auth.merchantCtaLink")} →
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

function Field({
  label,
  type,
  name,
  required = true,
}: {
  label: string;
  type: string;
  name: string;
  required?: boolean;
}) {
  return (
    <div className="mb-3">
      <label htmlFor={name} className="mb-1.5 block text-[11px] font-extrabold text-neutral">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="h-11 w-full rounded-xl border border-line px-3 outline-none transition focus:border-focus-border focus:shadow-[0_0_0_3px_var(--color-focus-ring)]"
      />
    </div>
  );
}

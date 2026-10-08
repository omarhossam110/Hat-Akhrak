"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";

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
  const router = useRouter();
  const isSignup = mode === "signup";

  const query = redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // No backend wired up yet — once Supabase auth is connected, this will
    // call supabase.auth.signInWithPassword / signUp instead of just
    // navigating. For now it mirrors the wireframe's demo flow.
    router.push(redirectTo ?? "/deals");
  }

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

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <Field label={t("auth.name")} type="text" name="name" />
          )}
          <Field label={t("auth.phone")} type="tel" name="phone" />
          {isSignup && (
            <Field label={t("auth.email")} type="email" name="email" />
          )}
          <Field label={t("auth.password")} type="password" name="password" />

          <button
            type="submit"
            className="w-full rounded-xl bg-brand px-4 py-[11px] text-center text-xs font-black text-[#151515] transition hover:brightness-95"
          >
            {isSignup ? t("auth.signupBtn") : t("auth.loginBtn")} →
          </button>
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

function Field({
  label,
  type,
  name,
}: {
  label: string;
  type: string;
  name: string;
}) {
  return (
    <div className="mb-3">
      <label
        htmlFor={name}
        className="mb-1.5 block text-[11px] font-extrabold text-neutral"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        className="h-11 w-full rounded-xl border border-line px-3 outline-none transition focus:border-focus-border focus:shadow-[0_0_0_3px_var(--color-focus-ring)]"
      />
    </div>
  );
}

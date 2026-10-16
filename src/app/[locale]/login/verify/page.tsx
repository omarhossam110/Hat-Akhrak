import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { TWO_FACTOR_COOKIE } from "@/lib/auth/session";
import { TwoFactorVerifyForm } from "@/components/two-factor-forms";

export default async function TwoFactorLoginPage({
  searchParams,
}: PageProps<"/[locale]/login/verify">) {
  const { redirect: redirectParam } = await searchParams;
  const redirectTo = typeof redirectParam === "string" ? redirectParam : undefined;

  // No pending challenge (expired, or came here directly) → start over.
  if (!(await cookies()).get(TWO_FACTOR_COOKIE)) {
    redirect(`/${await getLocale()}/login`);
  }

  const t = await getTranslations();
  return (
    <div className="mx-auto max-w-[420px] px-[22px] py-[30px]">
      <div className="rounded-[22px] border border-line bg-surface p-[22px] shadow-[var(--shadow-card)]">
        <h1 className="mb-1 text-[19px] font-bold tracking-tight">{t("twoFactor.loginTitle")}</h1>
        <p className="mb-4 text-xs text-muted">{t("twoFactor.loginDesc")}</p>
        <TwoFactorVerifyForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}

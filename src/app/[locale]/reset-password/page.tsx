import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ResetPasswordForm } from "@/components/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/[locale]/reset-password">) {
  const { token } = await searchParams;
  const t = await getTranslations();

  if (typeof token !== "string" || !token) {
    return (
      <div className="mx-auto max-w-[1180px] px-[22px] py-[30px]">
        <div className="mx-auto max-w-[420px] rounded-[22px] border border-line bg-surface p-[22px] text-center shadow-[var(--shadow-card)]">
          <p className="text-sm leading-relaxed text-muted">
            {t("resetPassword.errorInvalidToken")}
          </p>
          <Link
            href="/forgot-password"
            className="mt-5 inline-block rounded-xl bg-brand px-5 py-2.5 text-xs font-black text-[#151515] transition hover:brightness-95"
          >
            {t("forgotPassword.title")} →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1180px] px-[22px] py-[30px]">
      <ResetPasswordForm token={token} />
    </div>
  );
}

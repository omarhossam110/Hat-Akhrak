import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getSession } from "@/lib/auth/session";
import { getTwoFactorStatus } from "@/lib/actions/two-factor";
import { TwoFactorPanel } from "@/components/two-factor-forms";

export default async function SecurityPage() {
  const locale = await getLocale();
  const session = await getSession();
  if (!session) {
    redirect(`/${locale}/login?redirect=${encodeURIComponent("/super-admin/security")}`);
  }
  if (session.role !== "super_admin") redirect(`/${locale}/`);

  const t = await getTranslations();
  const status = await getTwoFactorStatus();

  return (
    <div className="mx-auto max-w-[520px] px-[22px] py-[30px]">
      <div className="rounded-[22px] border border-line bg-surface p-[22px] shadow-[var(--shadow-card)]">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-[19px] font-bold tracking-tight">{t("twoFactor.title")}</h1>
          <span
            className={`inline-flex rounded-full px-2.5 py-1.5 text-[10px] font-extrabold ${
              status.enabled ? "bg-success-soft text-success" : "bg-warning-soft text-warning"
            }`}
          >
            {status.enabled ? t("twoFactor.statusOn") : t("twoFactor.statusOff")}
          </span>
        </div>
        <TwoFactorPanel enabled={status.enabled} codesLeft={status.recoveryCodesLeft} />
      </div>
    </div>
  );
}

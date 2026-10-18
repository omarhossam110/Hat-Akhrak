import { getTranslations } from "next-intl/server";
import { VerifyEmailCard } from "@/components/verify-email-card";

export default async function VerifyEmailPage({ searchParams }: PageProps<"/[locale]/verify-email">) {
  const { token } = await searchParams;
  const t = await getTranslations("verifyEmail");

  return (
    <div className="mx-auto max-w-[1180px] px-[22px] py-[30px]">
      {typeof token === "string" && token ? (
        <VerifyEmailCard token={token} />
      ) : (
        <p className="mx-auto max-w-[420px] rounded-[22px] border border-line bg-surface p-[22px] text-center text-sm text-muted shadow-[var(--shadow-card)]">
          {t("invalid")}
        </p>
      )}
    </div>
  );
}

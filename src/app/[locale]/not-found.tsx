import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-[1180px] px-[22px] py-20 text-center">
      <div className="mx-auto mb-4 grid h-[72px] w-[72px] place-items-center rounded-[20px] bg-neutral-soft text-3xl">
        🧭
      </div>
      <h1 className="mb-2 text-lg font-bold">{t("errors.notFoundTitle")}</h1>
      <p className="mx-auto mb-4 max-w-[380px] text-sm text-muted">{t("errors.notFoundDesc")}</p>
      <Link
        href="/"
        className="inline-block rounded-xl bg-brand px-4 py-[11px] text-xs font-black text-[#151515] transition hover:brightness-95"
      >
        {t("errors.backHome")}
      </Link>
    </div>
  );
}

"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";

export function LanguageSwitcher() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const nextLocale = locale === "ar" ? "en" : "ar";

  return (
    <button
      type="button"
      onClick={() => {
        router.replace(
          // @ts-expect-error -- dynamic route params are fine here
          { pathname, params },
          { locale: nextLocale }
        );
      }}
      className="text-sm font-medium text-neutral-200 hover:text-orange-400 transition"
      aria-label="Switch language"
    >
      {t("common.language")}
    </button>
  );
}

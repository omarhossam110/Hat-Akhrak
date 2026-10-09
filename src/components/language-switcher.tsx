"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const nextLocale = locale === "ar" ? "en" : "ar";
  const shortLabel = locale === "ar" ? "EN" : "ع";

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
      className="h-9 min-w-9 rounded-xl border border-line bg-surface px-2.5 text-xs font-extrabold text-ink transition hover:border-hover-border hover:bg-hover-soft sm:h-[42px] sm:min-w-[42px] sm:px-3"
      aria-label="Switch language"
    >
      {shortLabel}
    </button>
  );
}

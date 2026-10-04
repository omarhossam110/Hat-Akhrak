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
      className="h-[42px] min-w-[42px] rounded-xl border border-line bg-white px-3 text-xs font-extrabold text-ink transition hover:border-[#ffc46d] hover:bg-[#fffaf3]"
      aria-label="Switch language"
    >
      {shortLabel}
    </button>
  );
}

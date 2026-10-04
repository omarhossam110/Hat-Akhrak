import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";

export async function SiteHeader() {
  const t = await getTranslations();

  return (
    <header className="border-b border-navy-800/10 bg-navy-950">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-extrabold text-white">
          {t("common.appName")}
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/deals"
            className="hidden text-sm font-medium text-neutral-200 hover:text-orange-400 sm:inline"
          >
            {t("nav.deals")}
          </Link>
          <a
            href="#"
            className="hidden text-sm font-medium text-neutral-200 hover:text-orange-400 sm:inline"
          >
            {t("nav.howItWorks")}
          </a>
          <LanguageSwitcher />
          <button className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600">
            {t("nav.signup")}
          </button>
        </div>
      </nav>
    </header>
  );
}

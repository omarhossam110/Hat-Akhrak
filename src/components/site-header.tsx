import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { NavTabs } from "@/components/nav-tabs";

export async function SiteHeader() {
  const t = await getTranslations();

  const navItems = [
    { href: "/", label: t("nav.home") },
    { href: "/deals", label: t("nav.deals") },
    { href: "/how-it-works", label: t("nav.howItWorks") },
    { href: "/merchants", label: t("nav.merchants") },
    { href: "/orders", label: t("nav.myOrders") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1180px] items-center gap-[22px] px-[22px]">
        <Link
          href="/"
          className="flex items-center whitespace-nowrap text-[22px] font-extrabold tracking-tight text-ink"
        >
          {t("common.appName")}
          <span className="ms-1.5 inline-block h-2.5 w-2.5 rounded-full bg-brand" />
        </Link>

        <div className="relative hidden max-w-[470px] flex-1 sm:block">
          <input
            placeholder={t("common.searchPlaceholder")}
            className="h-11 w-full rounded-[14px] border border-line bg-[#f9fafb] ps-11 pe-4 text-sm outline-none transition focus:border-[#ffbd66] focus:bg-white focus:shadow-[0_0_0_4px_#fff1df]"
          />
          <span className="pointer-events-none absolute inset-y-0 start-4 flex items-center text-[#98a2b3]">
            ⌕
          </span>
        </div>

        <div className="ms-auto flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            href="/login"
            className="grid h-[42px] min-w-[42px] place-items-center rounded-xl border border-line bg-white text-ink transition hover:border-[#ffc46d] hover:bg-[#fffaf3]"
            aria-label={t("nav.login")}
          >
            👤
          </Link>
          <Link
            href="/orders"
            className="grid h-[42px] min-w-[42px] place-items-center rounded-xl border border-line bg-white text-ink transition hover:border-[#ffc46d] hover:bg-[#fffaf3]"
            aria-label={t("nav.myOrders")}
          >
            🛒
          </Link>
        </div>
      </div>

      <nav className="overflow-x-auto border-t border-[#f2f4f7] bg-white">
        <NavTabs items={navItems} />
      </nav>
    </header>
  );
}

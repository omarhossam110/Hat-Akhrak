import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
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
    <header className="sticky top-0 z-50 border-b border-line bg-surface/90 backdrop-blur-xl">
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
            className="h-11 w-full rounded-[14px] border border-line bg-surface-2 ps-11 pe-4 text-sm outline-none transition focus:border-focus-border focus:bg-surface focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
          <span className="pointer-events-none absolute inset-y-0 start-4 flex items-center text-muted-2">
            ⌕
          </span>
        </div>

        <div className="ms-auto flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link
            href="/login"
            className="grid h-[42px] min-w-[42px] place-items-center rounded-xl border border-line bg-surface text-ink transition hover:border-hover-border hover:bg-hover-soft"
            aria-label={t("nav.login")}
          >
            👤
          </Link>
          <Link
            href="/orders"
            className="grid h-[42px] min-w-[42px] place-items-center rounded-xl border border-line bg-surface text-ink transition hover:border-hover-border hover:bg-hover-soft"
            aria-label={t("nav.myOrders")}
          >
            🛒
          </Link>
        </div>
      </div>

      <nav className="overflow-x-auto border-t border-line bg-surface">
        <NavTabs items={navItems} />
      </nav>
    </header>
  );
}

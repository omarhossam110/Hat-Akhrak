import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavTabs } from "@/components/nav-tabs";
import { NotificationsBell } from "@/components/notifications-bell";
import { buildNotifications } from "@/lib/mock-notifications";
import { HeaderSearch } from "@/components/header-search";
import { mockDeals } from "@/lib/mock-deals";

export async function SiteHeader() {
  const t = await getTranslations();
  const notifications = buildNotifications();

  const navItems = [
    { href: "/", label: t("nav.home") },
    { href: "/deals", label: t("nav.deals") },
    { href: "/how-it-works", label: t("nav.howItWorks") },
    { href: "/merchants", label: t("nav.merchants") },
    { href: "/orders", label: t("nav.myOrders") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1180px] items-center gap-3 px-3 sm:gap-[22px] sm:px-[22px]">
        <Link
          href="/"
          className="flex items-center whitespace-nowrap text-[18px] font-extrabold tracking-tight text-ink sm:text-[22px]"
        >
          {t("common.appName")}
          <span className="ms-1.5 inline-block h-2.5 w-2.5 rounded-full bg-brand" />
        </Link>

        <HeaderSearch deals={mockDeals} />

        <div className="ms-auto flex items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <NotificationsBell notifications={notifications} />
          <Link
            href="/wishlist"
            className="grid h-9 min-w-9 place-items-center rounded-xl border border-line bg-surface text-ink transition hover:border-hover-border hover:bg-hover-soft sm:h-[42px] sm:min-w-[42px]"
            aria-label={t("nav.wishlist")}
          >
            🤍
          </Link>
          <Link
            href="/login"
            className="grid h-9 min-w-9 place-items-center rounded-xl border border-line bg-surface text-ink transition hover:border-hover-border hover:bg-hover-soft sm:h-[42px] sm:min-w-[42px]"
            aria-label={t("nav.login")}
          >
            👤
          </Link>
          <Link
            href="/orders"
            className="hidden h-9 min-w-9 place-items-center rounded-xl border border-line bg-surface text-ink transition hover:border-hover-border hover:bg-hover-soft sm:grid sm:h-[42px] sm:min-w-[42px]"
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

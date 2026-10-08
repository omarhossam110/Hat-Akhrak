import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function SiteFooter() {
  const t = await getTranslations();

  const links = [
    { href: "/faq", label: t("nav.faq") },
    { href: "/terms", label: t("nav.terms") },
    { href: "/privacy", label: t("nav.privacy") },
  ];

  return (
    <footer className="border-t border-line bg-surface py-6 text-center text-sm text-muted">
      <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-3 px-[22px]">
        <nav className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <p>
          {t("common.appName")} — {t("common.tagline")}
        </p>
      </div>
    </footer>
  );
}

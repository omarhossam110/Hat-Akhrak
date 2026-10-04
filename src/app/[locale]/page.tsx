import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/language-switcher";

export default async function HomePage() {
  const t = await getTranslations();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-navy-800/10 bg-navy-950">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="text-lg font-extrabold text-white">
            {t("common.appName")}
          </span>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="hidden text-sm font-medium text-neutral-200 hover:text-orange-400 sm:inline"
            >
              {t("nav.deals")}
            </a>
            <a
              href="#"
              className="hidden text-sm font-medium text-neutral-200 hover:text-orange-400 sm:inline"
            >
              {t("nav.howItWorks")}
            </a>
            <LanguageSwitcher />
            <button className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition">
              {t("nav.signup")}
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <h1 className="text-3xl font-extrabold text-navy-950 sm:text-5xl">
            {t("home.heroTitle")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-700 sm:text-lg">
            {t("home.heroSubtitle")}
          </p>
          <button className="mt-8 rounded-xl bg-orange-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition">
            {t("home.cta")}
          </button>
        </section>
      </main>

      <footer className="border-t border-neutral-200 py-6 text-center text-sm text-neutral-500">
        {t("common.appName")} — {t("common.tagline")}
      </footer>
    </div>
  );
}

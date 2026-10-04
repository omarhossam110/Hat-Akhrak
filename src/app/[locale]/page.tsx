import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function HomePage() {
  const t = await getTranslations();

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
      <h1 className="text-3xl font-extrabold text-navy-950 sm:text-5xl">
        {t("home.heroTitle")}
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-700 sm:text-lg">
        {t("home.heroSubtitle")}
      </p>
      <Link
        href="/deals"
        className="mt-8 inline-block rounded-xl bg-orange-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
      >
        {t("home.cta")}
      </Link>
    </section>
  );
}

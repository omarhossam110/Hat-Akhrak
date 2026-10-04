import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const t = await getTranslations();

  return (
    <footer className="border-t border-neutral-200 py-6 text-center text-sm text-neutral-500">
      {t("common.appName")} — {t("common.tagline")}
    </footer>
  );
}

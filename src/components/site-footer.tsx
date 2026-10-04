import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const t = await getTranslations();

  return (
    <footer className="border-t border-line bg-white py-6 text-center text-sm text-muted">
      {t("common.appName")} — {t("common.tagline")}
    </footer>
  );
}

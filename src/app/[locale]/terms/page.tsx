import { getTranslations } from "next-intl/server";

const SECTION_COUNT = 7;

export default async function TermsPage() {
  const t = await getTranslations();

  const sections = Array.from({ length: SECTION_COUNT }, (_, i) => ({
    title: t(`terms.section${i + 1}Title`),
    body: t(`terms.section${i + 1}Body`),
  }));

  return (
    <div className="mx-auto max-w-[760px] px-[22px] py-[30px]">
      <div className="mb-8">
        <div className="mb-1.5 text-xs font-extrabold text-brand">{t("terms.eyebrow")}</div>
        <h1 className="mb-3 text-[28px] font-extrabold tracking-tight sm:text-[34px]">
          {t("terms.title")}
        </h1>
        <p className="text-sm text-muted">{t("terms.updatedAt")}</p>
      </div>

      <div className="flex flex-col gap-5">
        {sections.map((section, i) => (
          <div
            key={section.title}
            className="rounded-[18px] border border-line bg-surface p-[18px] shadow-[var(--shadow-card)]"
          >
            <h2 className="mb-2 text-sm font-extrabold">
              {i + 1}. {section.title}
            </h2>
            <p className="text-xs leading-relaxed text-muted">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

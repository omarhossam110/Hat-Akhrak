import { getTranslations } from "next-intl/server";
import { FaqAccordion } from "@/components/faq-accordion";

const FAQ_COUNT = 7;

export default async function FaqPage() {
  const t = await getTranslations();

  const items = Array.from({ length: FAQ_COUNT }, (_, i) => ({
    q: t(`faq.q${i + 1}`),
    a: t(`faq.a${i + 1}`),
  }));

  return (
    <div className="mx-auto max-w-[760px] px-[22px] py-[30px]">
      <div className="mb-8 max-w-[560px]">
        <div className="mb-1.5 text-xs font-extrabold text-brand">{t("faq.eyebrow")}</div>
        <h1 className="mb-3 text-[28px] font-extrabold tracking-tight sm:text-[34px]">
          {t("faq.title")}
        </h1>
        <p className="text-sm leading-relaxed text-muted">{t("faq.desc")}</p>
      </div>

      <FaqAccordion items={items} />
    </div>
  );
}

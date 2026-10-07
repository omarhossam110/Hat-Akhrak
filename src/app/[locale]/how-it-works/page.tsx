import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const STEP_ICONS = ["🔎", "👥", "⏱", "📦"];

export default async function HowItWorksPage() {
  const t = await getTranslations();

  const steps = [1, 2, 3, 4].map((n) => ({
    icon: STEP_ICONS[n - 1],
    title: t(`howItWorks.step${n}Title`),
    desc: t(`howItWorks.step${n}Desc`),
  }));

  const tiers = [
    { range: "5–9", price: 480 },
    { range: "10–14", price: 420 },
    { range: "15–20", price: 340 },
  ];

  return (
    <div className="mx-auto max-w-[1180px] px-[22px] py-[30px]">
      <div className="mb-10 max-w-[640px]">
        <div className="mb-1.5 text-xs font-extrabold text-brand">{t("howItWorks.eyebrow")}</div>
        <h1 className="mb-3 text-[30px] font-extrabold tracking-tight sm:text-[34px]">
          {t("howItWorks.title")}
        </h1>
        <p className="text-sm leading-relaxed text-muted">{t("howItWorks.desc")}</p>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className="relative rounded-[18px] border border-line bg-surface p-[18px] shadow-[var(--shadow-card)]"
          >
            <div className="mb-3.5 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-[13px] bg-brand-soft text-xl">
                {step.icon}
              </span>
              <span className="font-sans text-xs font-extrabold text-muted-2">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="mb-1.5 text-base font-extrabold">{step.title}</h3>
            <p className="text-xs leading-relaxed text-muted">{step.desc}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[22px] border border-line bg-surface p-[22px] shadow-[var(--shadow-card)]">
        <h2 className="mb-1.5 text-base font-extrabold">{t("howItWorks.tiersTitle")}</h2>
        <p className="mb-4 text-xs text-muted">{t("howItWorks.tiersDesc")}</p>
        <div className="grid grid-cols-3 gap-2">
          {tiers.map((tier, i) => (
            <div
              key={tier.range}
              className={`rounded-[14px] border text-center ${
                i === 1
                  ? "border-2 border-success bg-success-soft p-[11px]"
                  : "border-line bg-surface p-3"
              }`}
            >
              <small className="mb-1 block text-[10px] text-muted">
                {tier.range} {t("deals.buyers")}
              </small>
              <b className={`font-sans text-[15px] ${i === 1 ? "text-success" : ""}`}>
                {tier.price} {t("common.egp")}
              </b>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/deals"
          className="inline-block rounded-xl bg-brand px-6 py-3 text-xs font-black text-[#151515] transition hover:brightness-95"
        >
          {t("howItWorks.cta")} →
        </Link>
      </div>
    </div>
  );
}

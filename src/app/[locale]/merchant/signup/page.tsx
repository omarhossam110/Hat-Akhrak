import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { submitMerchantApplicationAction } from "@/lib/actions/merchant-applications";
import { LeadTracker } from "@/components/lead-tracker";

export default async function MerchantSignupPage({
  searchParams,
}: PageProps<"/[locale]/merchant/signup">) {
  const { submitted } = await searchParams;
  const t = await getTranslations();

  if (submitted === "1") {
    return (
      <div className="mx-auto max-w-[480px] px-[22px] py-[50px] text-center">
        <LeadTracker />
        <div className="rounded-[22px] border border-line bg-surface p-[30px] shadow-[var(--shadow-card)]">
          <div className="mb-3 text-[44px]">✅</div>
          <h1 className="mb-2 text-[20px] font-extrabold">
            {t("merchantSignup.submittedTitle")}
          </h1>
          <p className="text-sm leading-relaxed text-muted">
            {t("merchantSignup.submittedDesc")}
          </p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-xl bg-brand px-5 py-2.5 text-xs font-black text-[#151515] transition hover:brightness-95"
          >
            {t("merchantSignup.backHome")} →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[620px] px-[22px] py-[30px]">
      <form
        action={submitMerchantApplicationAction}
        className="rounded-[22px] border border-line bg-surface p-[22px] shadow-[var(--shadow-card)]"
      >
        <div className="mb-1.5 text-xs font-extrabold uppercase tracking-wide text-brand">
          {t("merchantSignup.eyebrow")}
        </div>
        <h1 className="mb-1.5 text-[26px] font-extrabold tracking-tight">
          {t("merchantSignup.title")}
        </h1>
        <p className="mb-5 text-xs leading-relaxed text-muted">{t("merchantSignup.desc")}</p>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label={t("merchantSignup.fieldBusinessName")} name="business_name" />
          </div>
          <Field label={t("merchantSignup.fieldOwnerName")} name="owner_name" />
          <Field label={t("merchantSignup.fieldPhone")} name="phone" type="tel" />
          <div className="sm:col-span-2">
            <Field label={t("merchantSignup.fieldEmail")} name="email" type="email" />
          </div>
          <div className="sm:col-span-2">
            <Field
              label={t("merchantSignup.fieldTaxId")}
              name="tax_id"
              required={false}
            />
          </div>
        </div>

        <div className="my-3.5 rounded-xl bg-info-soft p-3 text-[11px] leading-relaxed text-info-text">
          ℹ {t("merchantSignup.reviewNote")}
        </div>

        <button
          type="submit"
          className="block w-full rounded-xl bg-brand px-4 py-[11px] text-center text-xs font-black text-[#151515] transition hover:brightness-95"
        >
          {t("merchantSignup.submitBtn")} →
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-[11px] font-extrabold text-neutral">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="h-11 w-full rounded-xl border border-line px-3 outline-none transition focus:border-focus-border focus:shadow-[0_0_0_3px_var(--color-focus-ring)]"
      />
    </div>
  );
}

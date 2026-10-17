import { getTranslations, getLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { getDeal } from "@/lib/actions/public-deals";
import { getSession } from "@/lib/auth/session";
import { PayNowButton } from "@/components/pay-now-button";
import { getLastDelivery } from "@/lib/actions/orders";

export default async function PaymentPage({
  params,
  searchParams,
}: PageProps<"/[locale]/payment/[id]">) {
  const { id } = await params;
  const { qty } = await searchParams;
  const card = await getDeal(id);

  if (!card) notFound();

  const t = await getTranslations();
  const locale = await getLocale();

  // Only a signed-in customer can pay a deposit — a guest who lands here
  // (e.g. via a shared link) goes through login and comes straight back.
  const session = await getSession();
  if (!session) {
    redirect(
      `/${locale}/login?redirect=${encodeURIComponent(`/payment/${id}${qty ? `?qty=${qty}` : ""}`)}`,
    );
  }

  // 1 or 2 units only (spec 3.3); the backend enforces this too.
  const quantity = Math.min(2, Math.max(1, Number(qty) || 1));
  const { deal, cycle, depositAmount } = card;
  const title = locale === "ar" ? deal.title_ar ?? deal.title : deal.title_en ?? deal.title;
  const lastDelivery = await getLastDelivery();
  const amountDue = Number((depositAmount * quantity).toFixed(2));

  const steps = [
    { label: t("payment.stepDeal"), active: true },
    { label: t("payment.stepPayment"), active: true },
    { label: t("payment.stepDone"), active: false },
  ];

  return (
    <div className="mx-auto max-w-[1180px] px-[22px] py-[30px]">
      <div className="mb-5 flex items-center">
        {steps.map((step, i) => (
          <div key={step.label} className="flex flex-1 items-center last:flex-none">
            <div
              className={`flex items-center gap-1.5 text-[11px] font-extrabold ${
                step.active ? "text-ink" : "text-muted-2"
              }`}
            >
              <span
                className={`grid h-[26px] w-[26px] place-items-center rounded-full ${
                  step.active ? "bg-brand text-[#111]" : "bg-neutral-soft"
                }`}
              >
                {i + 1}
              </span>
              {step.label}
            </div>
            {i < steps.length - 1 && <span className="mx-2 h-0.5 flex-1 bg-line" />}
          </div>
        ))}
      </div>

      <div className="mx-auto grid max-w-[850px] grid-cols-1 gap-4 lg:grid-cols-[1fr_0.75fr]">
        <div className="rounded-[22px] border border-line bg-surface p-[22px] shadow-[var(--shadow-card)]">
          <h1 className="mb-1.5 text-2xl font-extrabold tracking-tight">{t("payment.title")}</h1>
          <p className="mb-1.5 text-xs font-bold text-ink">{title}</p>
          <p className="text-xs text-muted">{t("payment.methodNote")}</p>
          <PayNowButton
            dealId={deal.id}
            cycleId={cycle.id}
            units={quantity}
            amount={amountDue}
            defaults={lastDelivery ?? { name: "", phone: "", governorate: "", city: "", address: "" }}
          />
        </div>

        <div className="rounded-[22px] border border-line bg-surface p-7 text-center shadow-[var(--shadow-card)]">
          <div className="text-[11px] text-muted">{t("payment.amountDueNow")}</div>
          <strong className="my-1 block font-sans text-[40px]">
            {amountDue} {t("common.egp")}
          </strong>
          <p className="text-[11px] text-muted">
            {t("payment.subUnits", { qty: quantity, amount: depositAmount })}
          </p>
          <div className="mt-3 text-[10px] text-success">🔒 {t("payment.secureNote")}</div>
        </div>
      </div>
    </div>
  );
}

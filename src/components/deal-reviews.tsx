import { getTranslations, getLocale } from "next-intl/server";
import type { Review } from "@/lib/mock-reviews";
import { submitReviewAction } from "@/lib/actions/reviews";

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="font-sans tracking-tight text-warning" aria-hidden>
      {"★".repeat(full)}
      <span className="text-muted-2">{"★".repeat(5 - full)}</span>
    </span>
  );
}

export async function DealReviews({
  dealId,
  reviews,
  average,
  count,
}: {
  dealId: string;
  reviews: Review[];
  average: number;
  count: number;
}) {
  const t = await getTranslations();
  const locale = await getLocale();

  return (
    <div className="mt-6 rounded-[22px] border border-line bg-surface p-[22px] shadow-[var(--shadow-card)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-extrabold">{t("reviews.title")}</h2>
        {count > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <Stars rating={average} />
            <b className="font-sans">{average}</b>
            <span className="text-muted">
              ({t("reviews.countLabel", { count })})
            </span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="mb-5 text-xs text-muted">{t("reviews.empty")}</p>
      ) : (
        <div className="mb-5 flex flex-col gap-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-line p-3.5 text-xs">
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <b className="text-[13px]">{review.customerName}</b>
                <Stars rating={review.rating} />
              </div>
              <p className="leading-relaxed text-muted">{review.comment}</p>
              <p className="mt-1.5 text-[10px] text-muted-2">
                {new Date(review.createdAt).toLocaleDateString(
                  locale === "ar" ? "ar-EG" : "en-US"
                )}
              </p>
            </div>
          ))}
        </div>
      )}

      <form
        action={submitReviewAction}
        className="border-t border-line pt-4"
      >
        <input type="hidden" name="deal_id" value={dealId} />
        <h3 className="mb-2.5 text-xs font-bold text-muted">{t("reviews.formTitle")}</h3>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_140px]">
          <input
            type="text"
            name="customer_name"
            required
            placeholder={t("reviews.fieldName")}
            aria-label={t("reviews.fieldName")}
            className="h-11 rounded-xl border border-line bg-surface px-3.5 text-xs outline-none transition focus:border-focus-border focus:shadow-[0_0_0_3px_var(--color-focus-ring)]"
          />
          <select
            name="rating"
            defaultValue="5"
            aria-label={t("reviews.fieldRating")}
            className="h-11 rounded-xl border border-line bg-surface px-3.5 text-xs font-bold outline-none transition focus:border-brand"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {"★".repeat(n)} ({n})
              </option>
            ))}
          </select>
        </div>
        <textarea
          name="comment"
          required
          rows={3}
          placeholder={t("reviews.fieldComment")}
          aria-label={t("reviews.fieldComment")}
          className="mt-2.5 w-full resize-none rounded-xl border border-line bg-surface p-3.5 text-xs outline-none transition focus:border-focus-border focus:shadow-[0_0_0_3px_var(--color-focus-ring)]"
        />
        <button
          type="submit"
          className="mt-2.5 rounded-xl bg-brand px-5 py-2.5 text-xs font-black text-[#151515] transition hover:brightness-95"
        >
          {t("reviews.submitBtn")}
        </button>
      </form>
    </div>
  );
}

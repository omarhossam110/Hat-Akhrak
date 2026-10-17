import { getTranslations, getLocale } from "next-intl/server";
import type { Review } from "@/lib/actions/reviews";
import { ReviewForm } from "@/components/review-form";

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
  reviewableOrderId,
}: {
  dealId: string;
  reviews: Review[];
  average: number;
  count: number;
  reviewableOrderId: string | null;
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

      {reviewableOrderId ? (
        <ReviewForm dealId={dealId} orderId={reviewableOrderId} />
      ) : (
        <p className="border-t border-line pt-4 text-[11px] text-muted">{t("reviews.onlyBuyers")}</p>
      )}
    </div>
  );
}

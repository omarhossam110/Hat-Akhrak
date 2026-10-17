"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { submitReviewAction } from "@/lib/actions/reviews";
import type { ActionState } from "@/lib/backend/post-action";
import { ActionError } from "@/components/action-error";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-brand px-5 py-2.5 text-xs font-black text-[#151515] transition hover:brightness-95 disabled:opacity-60"
    >
      {label}
    </button>
  );
}

/** Shown only to a customer with a completed, not-yet-reviewed order on the deal. */
export function ReviewForm({ dealId, orderId }: { dealId: string; orderId: string }) {
  const t = useTranslations();
  const initial: ActionState = undefined;
  const [state, formAction] = useActionState(submitReviewAction.bind(null, dealId, orderId), initial);

  return (
    <form action={formAction} className="border-t border-line pt-4">
      <h3 className="mb-2.5 text-xs font-bold text-muted">{t("reviews.formTitle")}</h3>
      <select
        name="rating"
        defaultValue="5"
        aria-label={t("reviews.fieldRating")}
        className="h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-xs font-bold outline-none transition focus:border-brand sm:w-[160px]"
      >
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>
            {"★".repeat(n)} ({n})
          </option>
        ))}
      </select>
      <textarea
        name="comment"
        required
        minLength={3}
        maxLength={1000}
        rows={3}
        placeholder={t("reviews.fieldComment")}
        aria-label={t("reviews.fieldComment")}
        className="mt-2.5 w-full resize-none rounded-xl border border-line bg-surface p-3.5 text-xs outline-none transition focus:border-focus-border focus:shadow-[0_0_0_3px_var(--color-focus-ring)]"
      />
      <div className="mt-2.5 flex items-center gap-3">
        <Submit label={t("reviews.submitBtn")} />
        <ActionError state={state} ns="reviews" known={["not_reviewable", "already_reviewed"]} />
      </div>
    </form>
  );
}

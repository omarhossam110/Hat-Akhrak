"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { updateBioAction } from "@/lib/actions/merchant-deals";
import type { ActionState } from "@/lib/backend/post-action";

export function MerchantBioForm({ initialBio }: { initialBio: string }) {
  const t = useTranslations("merchantDashboard");
  const [state, action, pending] = useActionState<ActionState, FormData>(
    updateBioAction,
    undefined,
  );

  return (
    <form
      action={action}
      className="mb-4 rounded-[18px] border border-line bg-surface p-[17px] shadow-[var(--shadow-card)]"
    >
      <label htmlFor="bio" className="mb-0.5 block text-sm font-extrabold">
        {t("bioTitle")}
      </label>
      <p className="mb-2.5 text-[11px] text-muted">{t("bioHint")}</p>
      <textarea
        id="bio"
        name="bio"
        rows={3}
        maxLength={500}
        defaultValue={initialBio}
        className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none transition focus:border-focus-border focus:shadow-[0_0_0_3px_var(--color-focus-ring)]"
      />
      <div className="mt-2.5 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-brand px-4 py-2 text-xs font-black text-[#151515] transition hover:brightness-95 disabled:opacity-60"
        >
          {t("bioSave")}
        </button>
        {state && "ok" in state && (
          <span className="text-[11px] font-bold text-success">{t("bioSaved")}</span>
        )}
        {state && "error" in state && (
          <span className="text-[11px] font-bold text-danger">{t("bioError")}</span>
        )}
      </div>
    </form>
  );
}

"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// Shown when something throws while rendering a page. The header/footer stay
// (this boundary sits inside the locale layout); `reset` retries the render.
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();

  useEffect(() => {
    // Visible in the browser console and picked up by any error reporter later.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-[1180px] px-[22px] py-20 text-center">
      <div className="mx-auto mb-4 grid h-[72px] w-[72px] place-items-center rounded-[20px] bg-danger-soft text-3xl">
        ⚠️
      </div>
      <h1 className="mb-2 text-lg font-bold">{t("errors.somethingWrongTitle")}</h1>
      <p className="mx-auto mb-4 max-w-[380px] text-sm text-muted">{t("errors.somethingWrongDesc")}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-brand px-4 py-[11px] text-xs font-black text-[#151515] transition hover:brightness-95"
        >
          {t("errors.tryAgain")}
        </button>
        <Link
          href="/"
          className="rounded-xl border border-line px-4 py-[11px] text-xs font-bold transition hover:bg-hover-soft"
        >
          {t("errors.backHome")}
        </Link>
      </div>
      {error.digest && <p className="mt-6 font-sans text-[10px] text-muted-2">ref: {error.digest}</p>}
    </div>
  );
}

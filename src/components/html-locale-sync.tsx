"use client";

import { useLayoutEffect } from "react";
import { useLocale } from "next-intl";

/**
 * <html lang>/<html dir> live on the true root layout (app/layout.tsx),
 * which the App Router preserves across a client-side locale switch (that's
 * what avoids remounting the <head> script — see that file's comment). But
 * "preserved" means its own SSR'd attributes from the *previous* locale
 * stick around after a soft navigation to the other locale, since that
 * ancestor segment doesn't re-render. This runs inside the nested
 * app/[locale]/layout.tsx instead, which *does* re-render on every
 * navigation, and corrects the two attributes on the client right after.
 * useLayoutEffect (not useEffect) so it applies before paint.
 */
export function HtmlLocaleSync() {
  const locale = useLocale();

  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return null;
}

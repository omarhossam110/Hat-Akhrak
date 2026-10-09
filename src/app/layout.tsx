import type { Metadata } from "next";
import Script from "next/script";
import { getLocale } from "next-intl/server";
import { MetaPixel } from "@/components/meta-pixel";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import "@fontsource/tajawal/400.css";
import "@fontsource/tajawal/500.css";
import "@fontsource/tajawal/700.css";
import "@fontsource/tajawal/800.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hat Akhrak | هات آخرك",
  description:
    "Egyptian group-buying marketplace — join a cycle, the price drops as more people buy.",
};

/**
 * True root layout — no dynamic route params of its own (unlike
 * app/[locale]/layout.tsx below it). This is what makes it a stable
 * ancestor segment: the App Router preserves it across a client-side
 * locale switch instead of tearing it down and recreating it, which is
 * exactly what previously caused the dev-only "Encountered a script tag
 * while rendering React component" warning — Next's <Script> component
 * still renders a literal <script> DOM node on mount, and remounting it
 * on every language switch hit that path every time.
 *
 * `getLocale()` still resolves correctly here (next-intl's middleware
 * populates the request-scoped locale for the whole request regardless of
 * which layout reads it), so the initial SSR'd `lang`/`dir` are already
 * correct on every direct page load — no flash. A client-side locale
 * switch doesn't re-render this stable ancestor, so `<HtmlLocaleSync>`
 * (mounted inside the nested locale layout, which *does* re-render on
 * every navigation) corrects `lang`/`dir` on the client for that case.
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  return (
    <html lang={locale} dir={dir} className="h-full antialiased" suppressHydrationWarning>
      <head>
        <Script src="/theme-init.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        {/* Guarded like the Supabase client: no-ops until a real pixel ID is configured. */}
        {metaPixelId && <MetaPixel pixelId={metaPixelId} />}
        {children}
      </body>
    </html>
  );
}

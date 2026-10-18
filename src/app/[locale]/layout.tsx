import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { EmailVerifyBanner } from "@/components/email-verify-banner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HtmlLocaleSync } from "@/components/html-locale-sync";
import { WishlistProvider } from "@/lib/use-wishlist";
import { getWishlistIds } from "@/lib/actions/wishlist";
import { getSession } from "@/lib/auth/session";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();
  const session = await getSession();
  const wishlistIds = session?.role === "customer" ? await getWishlistIds() : null;

  return (
    <NextIntlClientProvider messages={messages}>
      <HtmlLocaleSync />
      <WishlistProvider key={session?.sub ?? "guest"} serverIds={wishlistIds}>
        <SiteHeader />
        {session && session.emailVerified === false && <EmailVerifyBanner />}
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </WishlistProvider>
    </NextIntlClientProvider>
  );
}

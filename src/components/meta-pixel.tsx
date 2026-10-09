"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

/**
 * Base Meta Pixel loader (fbq init + the standard automatic PageView),
 * mounted once in the locale-agnostic root layout so it survives every
 * locale switch. Only rendered when NEXT_PUBLIC_META_PIXEL_ID is set (see
 * src/app/layout.tsx) — same guarded-until-configured pattern as the
 * Supabase client.
 *
 * The base snippet's own PageView only fires on the very first load; the
 * App Router's client-side navigations never trigger another one on their
 * own, so <PixelPageViewTracker> below fires one on every subsequent
 * pathname/query change.
 */
export function MetaPixel({ pixelId }: { pixelId: string }) {
  return (
    <>
      <Script id="meta-pixel-base" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
          document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      {/* useSearchParams requires a Suspense boundary */}
      <Suspense fallback={null}>
        <PixelPageViewTracker />
      </Suspense>
    </>
  );
}

function PixelPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the first render — the base snippet above already fired this
    // load's PageView; only track subsequent client-side navigations.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  }, [pathname, searchParams]);

  return null;
}

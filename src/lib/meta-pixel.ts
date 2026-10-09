/**
 * Thin wrapper around the Meta Pixel's `fbq` global. Safe to call from
 * anywhere — no-ops if the pixel isn't loaded (no NEXT_PUBLIC_META_PIXEL_ID
 * configured, SSR, or ad blockers stripping the script).
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function isMetaPixelEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID);
}

export function trackMetaEvent(
  event: string,
  params?: Record<string, string | number>
) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("track", event, params);
}

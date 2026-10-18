// Shared by the session helpers and the middleware (which must not import
// next/headers), so the cookie names / lifetimes live in exactly one place.
export const SESSION_COOKIE = "hat_akhrak_session";
export const REFRESH_COOKIE = "hat_akhrak_refresh";
// Both cookies live as long as the backend's refresh token (30 days); the
// access token inside the first one expires much sooner (15 min) and is
// swapped for a new one by the middleware using the second.
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type SessionTokens = { accessToken: string; refreshToken: string };

export const sessionCookieOptions = (maxAge = SESSION_MAX_AGE_SECONDS) => ({
  httpOnly: true,
  // Only forced over HTTPS in production — the dev server runs on plain http.
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});

import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import {
  REFRESH_COOKIE,
  SESSION_COOKIE,
  sessionCookieOptions,
  type SessionTokens,
} from "./lib/auth/cookie-names";

const intlMiddleware = createIntlMiddleware(routing);
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3001/api";

/** Seconds until the (unverified — only used for timing) JWT expires; 0 if unreadable. */
function secondsLeft(jwt: string): number {
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp - Math.floor(Date.now() / 1000) : 0;
  } catch {
    return 0;
  }
}

type Refreshed = { tokens: SessionTokens } | { loggedOut: true } | null;

// Server Components can't set cookies, so the renewal happens here, before the
// page renders. A short-lived access token (15 min) is swapped for a new one
// using the refresh token; the page then sees the new cookie on this same request.
async function refreshSession(request: NextRequest): Promise<Refreshed> {
  const access = request.cookies.get(SESSION_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!access && !refreshToken) return null;
  if (access && secondsLeft(access) > 60) return null; // still good
  if (!refreshToken) return { loggedOut: true };

  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(ip ? { "X-Forwarded-For": ip } : {}) },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (res.status === 401) return { loggedOut: true }; // refresh token dead: sign out cleanly
    if (!res.ok) return null; // backend hiccup: keep cookies, try again next request
    const body = (await res.json()) as SessionTokens;
    return { tokens: { accessToken: body.accessToken, refreshToken: body.refreshToken } };
  } catch {
    return null;
  }
}

const isDev = process.env.NODE_ENV === "development";

// Enforced Content-Security-Policy with a fresh nonce per request. Next reads
// the nonce out of the request's CSP header and stamps it on its own scripts
// (and on <Script>), 'strict-dynamic' lets those load their chunks and the Meta
// Pixel loader, and anything injected without the nonce is refused.
// Styles keep 'unsafe-inline' because React/Tailwind use style="" attributes,
// which nonces can't cover (inline styles can't run code; scripts are the risk).
function buildCsp(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://www.facebook.com https://connect.facebook.net",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "report-uri /api/csp-report",
  ].join("; ");
}

export default async function proxy(request: NextRequest) {
  const refreshed = await refreshSession(request);

  // Make the pages rendered for THIS request see the new cookies.
  if (refreshed && "tokens" in refreshed) {
    request.cookies.set(SESSION_COOKIE, refreshed.tokens.accessToken);
    request.cookies.set(REFRESH_COOKIE, refreshed.tokens.refreshToken);
  } else if (refreshed) {
    request.cookies.delete(SESSION_COOKIE);
    request.cookies.delete(REFRESH_COOKIE);
  }

  // Hand the nonce to Next through the request headers it renders from.
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);
  request.headers.set("x-nonce", nonce);
  request.headers.set("Content-Security-Policy", csp);

  const response = intlMiddleware(request) ?? NextResponse.next();
  response.headers.set("Content-Security-Policy", csp);

  if (refreshed && "tokens" in refreshed) {
    response.cookies.set(SESSION_COOKIE, refreshed.tokens.accessToken, sessionCookieOptions());
    response.cookies.set(REFRESH_COOKIE, refreshed.tokens.refreshToken, sessionCookieOptions());
  } else if (refreshed) {
    response.cookies.delete(SESSION_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|trpc|uploads|_next|_vercel|.*\\..*).*)"],
};

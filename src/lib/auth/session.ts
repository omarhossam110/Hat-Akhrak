import { cookies } from "next/headers";
import { cache } from "react";
import { BACKEND_URL } from "@/lib/backend/client";

// The one place that names the session cookie / its lifetime, so the
// Server Actions that set it and the helpers that read it never drift.
export const SESSION_COOKIE = "hat_akhrak_session";
// Mirrors the backend's JWT_EXPIRES_IN default (see hat-akhrak-backend's
// .env.example, "7d") — keep in sync if that's ever changed.
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type Role = "customer" | "merchant" | "super_admin";

export type SessionUser = {
  sub: string;
  email: string;
  role: Role;
  merchantId?: string;
};

/**
 * Reads the session cookie and asks the backend to confirm it's still
 * valid (GET /auth/me) rather than decoding the JWT locally — this app
 * never holds the signing secret, so that's the only way to actually
 * verify it rather than just read its shape. A tampered or expired cookie
 * resolves to `null` (logged out), not an error.
 *
 * Cached per request (React's `cache()`) since the header and whichever
 * page is rendering both need this.
 */
export const getSession = cache(async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as SessionUser;
  } catch {
    // Backend unreachable — degrade to "logged out" rather than throwing,
    // so a backend outage doesn't take the whole site down with it.
    return null;
  }
});

/** The raw bearer token, for a Server Action that needs to call the backend
 * as the signed-in user (e.g. a future "create order" action). */
export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

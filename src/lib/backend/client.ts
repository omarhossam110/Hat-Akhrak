// Thin fetch wrapper around the hat-akhrak-backend API (NestJS). Server-only
// — called from Server Actions and Server Components, never from the
// browser, so BACKEND_URL never needs a NEXT_PUBLIC_ prefix.

import { headers } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3001/api";

// Every browser request reaches the backend through this server, so without
// this the backend's rate limiter would see ONE client (us) for everybody.
// Pass the visitor's address along (the backend only trusts it when
// TRUST_PROXY is set, i.e. when it's reachable solely through us / Nginx).
async function clientIpHeader(): Promise<Record<string, string>> {
  try {
    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip");
    // Nginx's request id, so one visitor action is traceable through both logs.
    const reqId = h.get("x-request-id");
    return {
      ...(ip ? { "X-Forwarded-For": ip } : {}),
      ...(reqId ? { "X-Request-Id": reqId } : {}),
    };
  } catch {
    // Outside a request (no headers available) — nothing to forward.
    return {};
  }
}

export class BackendError extends Error {
  constructor(
    public status: number,
    message: string,
    // Optional stable machine-readable reason (e.g. "max_units") some
    // backend business-rule errors carry, so callers can show a translated
    // message instead of the backend's English text.
    public code?: string,
  ) {
    super(message);
    this.name = "BackendError";
  }
}

/**
 * Calls the backend and returns the parsed JSON body. Throws BackendError
 * (with the backend's HTTP status) on a non-2xx response, so callers can
 * branch on e.g. `err.status === 409` without re-parsing anything.
 */
export async function backendFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(await clientIpHeader()),
      ...init?.headers,
    },
    // These calls carry a specific user's request (login, signup, /me) —
    // never cache them across requests.
    cache: "no-store",
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const rawMessage = body?.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(" ")
      : rawMessage;
    throw new BackendError(
      res.status,
      message || "Something went wrong",
      body?.code,
    );
  }

  return body as T;
}

export { BACKEND_URL };

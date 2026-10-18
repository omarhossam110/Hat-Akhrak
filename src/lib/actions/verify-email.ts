"use server";

import { BackendError, backendFetch } from "@/lib/backend/client";
import { getSessionToken } from "@/lib/auth/session";

export type VerifyState = { done: true } | { error: "invalid" | "generic" } | undefined;

/** Confirms the email behind a link. Done on a button press (not on page
 * load) so mail scanners that prefetch links can't use the single-use token up. */
export async function verifyEmailAction(token: string): Promise<VerifyState> {
  try {
    await backendFetch("/auth/verify-email", { method: "POST", body: JSON.stringify({ token }) });
    return { done: true };
  } catch (err) {
    return { error: err instanceof BackendError && err.status === 400 ? "invalid" : "generic" };
  }
}

export type ResendState = "sent" | "already" | "error" | undefined;

export async function resendVerificationAction(): Promise<ResendState> {
  const token = await getSessionToken();
  if (!token) return "error";
  try {
    const res = await backendFetch<{ alreadyVerified: boolean }>("/auth/resend-verification", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.alreadyVerified ? "already" : "sent";
  } catch {
    return "error";
  }
}

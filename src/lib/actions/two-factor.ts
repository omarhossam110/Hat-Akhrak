"use server";

import QRCode from "qrcode";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { BackendError, backendFetch } from "@/lib/backend/client";
import {
  getSessionToken,
  setSessionCookie,
  TWO_FACTOR_COOKIE,
  type SessionTokens,
} from "@/lib/auth/session";

export type TwoFactorState =
  | { error: "expired" | "invalid" | "tooMany" | "generic" }
  | undefined;

export type SetupState =
  | {
      error?: "invalid" | "tooMany" | "generic";
      secret?: string;
      qr?: string;
      recoveryCodes?: string[];
    }
  | undefined;

function mapError(err: unknown): "expired" | "invalid" | "tooMany" | "generic" {
  if (err instanceof BackendError) {
    if (err.code === "challenge_expired") return "expired";
    if (err.status === 429) return "tooMany";
    if (err.status === 400 || err.status === 401) return "invalid";
  }
  return "generic";
}

async function authHeader() {
  const token = await getSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

/** Login step 2: the 6-digit code (or a recovery code) → a real session. */
export async function verifyTwoFactorAction(
  redirectTo: string | undefined,
  _prev: TwoFactorState,
  formData: FormData,
): Promise<TwoFactorState> {
  const code = String(formData.get("code") ?? "").trim();
  const jar = await cookies();
  const challengeToken = jar.get(TWO_FACTOR_COOKIE)?.value;
  if (!challengeToken) return { error: "expired" };
  if (!code) return { error: "invalid" };

  try {
    const session = await backendFetch<SessionTokens>("/auth/2fa/verify", {
      method: "POST",
      body: JSON.stringify({ challengeToken, code }),
    });
    jar.delete(TWO_FACTOR_COOKIE);
    await setSessionCookie(session);
  } catch (err) {
    return { error: mapError(err) };
  }

  const locale = await getLocale();
  redirect(`/${locale}${redirectTo ?? "/super-admin"}`);
}

export async function getTwoFactorStatus(): Promise<{ enabled: boolean; recoveryCodesLeft: number }> {
  const headers = await authHeader();
  if (!headers) return { enabled: false, recoveryCodesLeft: 0 };
  try {
    return await backendFetch("/auth/2fa/status", { headers });
  } catch {
    return { enabled: false, recoveryCodesLeft: 0 };
  }
}

/** Security page, step 1: mint a secret and render it as a QR code. */
export async function startTwoFactorSetupAction(): Promise<SetupState> {
  const headers = await authHeader();
  if (!headers) return { error: "generic" };
  try {
    const { secret, otpauthUri } = await backendFetch<{ secret: string; otpauthUri: string }>(
      "/auth/2fa/setup",
      { method: "POST", headers },
    );
    const qr = await QRCode.toDataURL(otpauthUri, { margin: 1, width: 220 });
    return { secret, qr };
  } catch (err) {
    return { error: mapError(err) === "tooMany" ? "tooMany" : "generic" };
  }
}

/** Step 2: confirm with a code. The backend swaps in a fresh mfa session and
 * returns the recovery codes — shown once, never retrievable again. */
export async function enableTwoFactorAction(
  _prev: SetupState,
  formData: FormData,
): Promise<SetupState> {
  const headers = await authHeader();
  if (!headers) return { error: "generic" };
  try {
    const result = await backendFetch<SessionTokens & { recoveryCodes: string[] }>(
      "/auth/2fa/enable",
      {
        method: "POST",
        headers,
        body: JSON.stringify({ code: String(formData.get("code") ?? "").trim() }),
      },
    );
    await setSessionCookie(result);
    return { recoveryCodes: result.recoveryCodes };
  } catch (err) {
    const e = mapError(err);
    return { error: e === "tooMany" || e === "invalid" ? e : "generic" };
  }
}

export async function disableTwoFactorAction(
  _prev: TwoFactorState,
  formData: FormData,
): Promise<TwoFactorState> {
  const headers = await authHeader();
  if (!headers) return { error: "expired" };
  try {
    const session = await backendFetch<SessionTokens>("/auth/2fa/disable", {
      method: "POST",
      headers,
      body: JSON.stringify({ code: String(formData.get("code") ?? "").trim() }),
    });
    await setSessionCookie(session);
  } catch (err) {
    return { error: mapError(err) };
  }
  const locale = await getLocale();
  redirect(`/${locale}/super-admin/security`);
}

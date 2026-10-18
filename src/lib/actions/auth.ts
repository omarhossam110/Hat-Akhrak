"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { BackendError, backendFetch } from "@/lib/backend/client";
import {
  REFRESH_COOKIE,
  SESSION_COOKIE,
  TWO_FACTOR_COOKIE,
  setSessionCookie,
  type SessionTokens,
} from "@/lib/auth/session";

type SessionResponse = SessionTokens;
type LoginResponse = SessionResponse | { twoFactorRequired: true; challengeToken: string };

export type AuthFormState = { error?: string } | undefined;

/** Bind the first two args (redirectTo, referredByCode) before passing this
 * to useActionState — see the AuthForm component. */
export async function loginAction(
  redirectTo: string | undefined,
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "errorGeneric" };
  }

  let challenge: string | undefined;
  try {
    const result = await backendFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if ("twoFactorRequired" in result) {
      // Password was right but this account has a second factor: keep only the
      // short-lived challenge and go ask for the code. No session yet.
      challenge = result.challengeToken;
      (await cookies()).set(TWO_FACTOR_COOKIE, challenge, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 5 * 60,
      });
    } else {
      await setSessionCookie(result);
    }
  } catch (err) {
    if (err instanceof BackendError && err.status === 401) {
      return { error: "errorInvalidCredentials" };
    }
    if (err instanceof BackendError && err.status === 429) {
      return { error: err.code === "account_locked" ? "errorAccountLocked" : "errorTooManyAttempts" };
    }
    return { error: "errorGeneric" };
  }

  const locale = await getLocale();
  if (challenge) {
    const qs = redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : "";
    redirect(`/${locale}/login/verify${qs}`);
  }
  redirect(`/${locale}${redirectTo ?? "/deals"}`);
}

export async function signupAction(
  redirectTo: string | undefined,
  referredByCode: string | undefined,
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const fullName = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || !password) {
    return { error: "errorGeneric" };
  }

  try {
    const session = await backendFetch<SessionResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        fullName,
        email,
        password,
        phone: phone || undefined,
        referredByCode: referredByCode || undefined,
      }),
    });
    await setSessionCookie(session);
  } catch (err) {
    if (err instanceof BackendError && err.status === 409) {
      return { error: "errorEmailTaken" };
    }
    if (err instanceof BackendError && err.status === 429) {
      return { error: "errorTooManyAttempts" };
    }
    return { error: "errorGeneric" };
  }

  const locale = await getLocale();
  redirect(`/${locale}${redirectTo ?? "/deals"}`);
}

/**
 * Merchant self-signup. Unlike the old mock-only flow, this now creates a
 * real login-capable account right away (role: merchant, unverified) —
 * matching what the backend's POST /auth/merchant-signup already does.
 * The merchant can log in immediately; they just stay unverified (no
 * "verified" badge, same as before) until a super admin approves them.
 */
export async function merchantSignupAction(formData: FormData) {
  const locale = await getLocale();

  const businessName = String(formData.get("business_name") ?? "").trim();
  const ownerName = String(formData.get("owner_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const taxId = String(formData.get("tax_id") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim().slice(0, 500);
  const password = String(formData.get("password") ?? "");

  if (!businessName || !ownerName || !email || !password) {
    redirect(`/${locale}/merchant/signup?error=generic`);
  }

  try {
    const session = await backendFetch<SessionResponse>("/auth/merchant-signup", {
      method: "POST",
      body: JSON.stringify({
        businessName,
        ownerName,
        email,
        password,
        phone: phone || undefined,
        taxId: taxId || undefined,
        bio: bio || undefined,
      }),
    });
    await setSessionCookie(session);
  } catch (err) {
    const code = err instanceof BackendError && err.status === 409 ? "email_taken" : "generic";
    redirect(`/${locale}/merchant/signup?error=${code}`);
  }

  redirect(`/${locale}/merchant/signup?submitted=1`);
}

export async function logoutAction() {
  const jar = await cookies();
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    // Ends this login server-side too; the person is logged out either way.
    await backendFetch("/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken }) }).catch(
      () => undefined,
    );
  }
  jar.delete(SESSION_COOKIE);
  jar.delete(REFRESH_COOKIE);
  const locale = await getLocale();
  redirect(`/${locale}/`);
}

export type ForgotPasswordState = { sent?: boolean; error?: string } | undefined;

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "errorGeneric" };
  }

  try {
    await backendFetch("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  } catch {
    // The backend itself never reveals whether the email is registered —
    // a network hiccup on our side shouldn't start leaking that either,
    // so this still reports success rather than surfacing the error.
  }

  return { sent: true };
}

export type ResetPasswordState = { success?: boolean; error?: string } | undefined;

/** Bind the token before passing this to useActionState — see the
 * ResetPasswordForm component. */
export async function resetPasswordAction(
  token: string,
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const newPassword = String(formData.get("newPassword") ?? "");

  if (!newPassword || newPassword.length < 8) {
    return { error: "errorPasswordTooShort" };
  }

  try {
    await backendFetch("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  } catch (err) {
    if (err instanceof BackendError && err.status === 400) {
      return { error: "errorInvalidToken" };
    }
    return { error: "errorGeneric" };
  }

  return { success: true };
}

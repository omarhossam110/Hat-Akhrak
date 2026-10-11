"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { BackendError, backendFetch } from "@/lib/backend/client";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session";

type SessionResponse = { accessToken: string };

async function setSessionCookie(token: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    // Only forced over HTTPS in production — the dev server runs on plain
    // http://localhost, where a Secure cookie would just never be sent.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

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

  try {
    const { accessToken } = await backendFetch<SessionResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await setSessionCookie(accessToken);
  } catch (err) {
    if (err instanceof BackendError && err.status === 401) {
      return { error: "errorInvalidCredentials" };
    }
    return { error: "errorGeneric" };
  }

  const locale = await getLocale();
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
    const { accessToken } = await backendFetch<SessionResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        fullName,
        email,
        password,
        phone: phone || undefined,
        referredByCode: referredByCode || undefined,
      }),
    });
    await setSessionCookie(accessToken);
  } catch (err) {
    if (err instanceof BackendError && err.status === 409) {
      return { error: "errorEmailTaken" };
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
  const password = String(formData.get("password") ?? "");

  if (!businessName || !ownerName || !email || !password) {
    redirect(`/${locale}/merchant/signup?error=generic`);
  }

  try {
    const { accessToken } = await backendFetch<SessionResponse>("/auth/merchant-signup", {
      method: "POST",
      body: JSON.stringify({
        businessName,
        ownerName,
        email,
        password,
        phone: phone || undefined,
        taxId: taxId || undefined,
      }),
    });
    await setSessionCookie(accessToken);
  } catch (err) {
    const code = err instanceof BackendError && err.status === 409 ? "email_taken" : "generic";
    redirect(`/${locale}/merchant/signup?error=${code}`);
  }

  redirect(`/${locale}/merchant/signup?submitted=1`);
}

export async function logoutAction() {
  (await cookies()).delete(SESSION_COOKIE);
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

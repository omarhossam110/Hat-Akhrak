import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { BackendError, backendFetch } from "@/lib/backend/client";
import { getSessionToken } from "@/lib/auth/session";

export type ActionState =
  | { error: "notSignedIn" | "rejected" | "generic"; code?: string }
  | { ok: true; message?: string }
  | undefined;

/** POSTs to the backend as the signed-in user and, on success, redirects to
 * the page the form lives on so it re-renders with fresh data. Business-rule
 * refusals (400/404) come back with the backend's stable `code`. */
export async function postAction(
  path: string,
  body: Record<string, unknown>,
  redirectTo: string,
): Promise<ActionState> {
  const token = await getSessionToken();
  if (!token) return { error: "notSignedIn" };

  try {
    await backendFetch(path, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  } catch (err) {
    if (err instanceof BackendError) {
      if (err.status === 401) return { error: "notSignedIn" };
      if (err.status === 400 || err.status === 404) return { error: "rejected", code: err.code };
    }
    return { error: "generic" };
  }

  const locale = await getLocale();
  redirect(`/${locale}${redirectTo}`);
}

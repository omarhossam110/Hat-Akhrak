import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  // Supabase session refresh is a no-op until the project's env vars are
  // configured (see .env.example) — this keeps dev/build working before
  // Supabase is connected, and activates automatically once it is.
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              response.cookies.set(name, value)
            );
          },
        },
      }
    );

    // Refreshes the auth token if it's expired — required for Server
    // Components, which can't write cookies themselves.
    await supabase.auth.getUser();
  }

  return response ?? NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};

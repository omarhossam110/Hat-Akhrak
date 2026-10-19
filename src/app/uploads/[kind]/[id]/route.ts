import { cookies } from "next/headers";
import { BACKEND_URL } from "@/lib/backend/client";
import { SESSION_COOKIE } from "@/lib/auth/cookie-names";

// Serves uploaded images from the same origin (the backend is never exposed
// publicly). Deal photos are public; invoice photos are forwarded with the
// visitor's session so the backend decides who may see them.
const KINDS = new Set(["deal", "invoice"]);
const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: Request, ctx: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await ctx.params;
  if (!KINDS.has(kind) || !ID.test(id)) return new Response("Not found", { status: 404 });

  const headers: Record<string, string> = {};
  if (kind === "invoice") {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return new Response("Not found", { status: 404 });
    headers.Authorization = `Bearer ${token}`;
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_URL}/uploads/${kind}/${id}`, { headers, cache: "no-store" });
  } catch {
    return new Response("Unavailable", { status: 502 });
  }
  if (!upstream.ok || !upstream.body) return new Response("Not found", { status: 404 });

  const out = new Headers({
    "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
    "X-Content-Type-Options": "nosniff",
    // Uploads are immutable and public (deal) or private (invoice).
    "Cache-Control":
      kind === "deal" ? "public, max-age=31536000, immutable" : "private, no-store",
    // A stray upload can never run script on our origin.
    "Content-Security-Policy": "default-src 'none'; img-src 'self'; sandbox",
  });
  return new Response(upstream.body, { status: 200, headers: out });
}

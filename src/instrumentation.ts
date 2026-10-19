import type { Instrumentation } from "next";

// Server-side errors (a page or Server Action that threw) as one JSON line, so
// they can be grepped in `docker compose logs frontend`. The `digest` is the
// same id shown to the visitor on the error page ("Error ID"), which is how a
// user's report is matched to its stack trace. No headers/cookies are logged.
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  const e = err instanceof Error ? err : new Error(String(err));
  const digest =
    typeof err === "object" && err !== null && "digest" in err ? String((err as { digest: unknown }).digest) : undefined;
  console.error(
    JSON.stringify({
      level: "error",
      msg: "render_error",
      digest,
      error: e.message,
      stack: e.stack,
      method: request.method,
      path: request.path.split("?")[0],
      route: context.routePath,
      routeType: context.routeType,
      ts: new Date().toISOString(),
    }),
  );
};

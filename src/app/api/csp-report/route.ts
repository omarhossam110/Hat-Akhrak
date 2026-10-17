// Receives CSP violation reports (browsers POST them here while the policy is
// in report-only mode). Logged server-side so the policy can be tuned; the
// body is capped and never echoed back.
export async function POST(request: Request) {
  try {
    const text = (await request.text()).slice(0, 4000);
    console.warn("[csp-report]", text);
  } catch {
    // ignore malformed reports
  }
  return new Response(null, { status: 204 });
}

/**
 * Wraps a `<script dangerouslySetInnerHTML>` the way Next.js's
 * "Preventing Flash" guide recommends: `type="text/javascript"` on the
 * server so the browser executes it synchronously while parsing the HTML
 * (before first paint), and `type="text/plain"` on the client so React
 * doesn't re-render/re-execute it (and doesn't warn about rendering a
 * <script> tag). `suppressHydrationWarning` covers the resulting type
 * mismatch between server and client.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

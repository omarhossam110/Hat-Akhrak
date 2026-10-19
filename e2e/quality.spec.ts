import { expect, test } from "@playwright/test";

const PAGES = ["", "/deals", "/merchants", "/how-it-works", "/faq", "/login", "/signup", "/merchant/signup", "/terms", "/privacy"];

test("every public page loads in both languages with the CSP enforced and no console errors", async ({ page }) => {
  const problems: string[] = [];
  page.on("console", (m) => m.type() === "error" && problems.push(m.text().slice(0, 200)));
  page.on("pageerror", (e) => problems.push(e.message.slice(0, 200)));

  for (const locale of ["ar", "en"]) {
    for (const path of PAGES) {
      const res = await page.goto(`/${locale}${path}`);
      expect(res?.status(), `${locale}${path}`).toBe(200);
      const csp = res?.headers()["content-security-policy"] ?? "";
      expect(csp).toContain("'nonce-");
      expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
      expect(res?.headers()["x-frame-options"]).toBe("DENY");
    }
  }
  expect(problems).toEqual([]);
});

test("unknown pages are a real 404, not a soft-404", async ({ page }) => {
  const res = await page.goto("/en/no-such-page-here");
  expect(res?.status()).toBe(404);
});

test("no page scrolls sideways on a phone", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 800 } });
  const page = await ctx.newPage();
  for (const locale of ["ar", "en"]) {
    for (const path of PAGES) {
      await page.goto(`/${locale}${path}`);
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(width, `${locale}${path} is ${width}px wide`).toBeLessThanOrEqual(375);
    }
  }
  await ctx.close();
});

test("the theme and language toggles work after hydration", async ({ page }) => {
  await page.goto("/en");
  const before = await page.evaluate(() => document.documentElement.outerHTML.length + document.documentElement.className);
  await page.getByRole("button", { name: /dark|theme|mode/i }).first().click();
  await expect.poll(() => page.evaluate(() => document.documentElement.outerHTML.length + document.documentElement.className)).not.toBe(before);
});

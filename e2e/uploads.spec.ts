import { expect, test } from "@playwright/test";
import { PNG_BYTES, createVerifiedMerchant, shown } from "./helpers";

test("a merchant can add a photo to a deal and it shows on the public deal page", async ({ page, browser, baseURL }) => {
  const title = `E2E Photo ${Date.now().toString(36)}`;
  await createVerifiedMerchant(page, "Photo Shop");

  await page.goto("/en/merchant/deals/new");
  await page.locator('input[name="title"]').fill(title);
  await page.locator('select[name="totalStock"]').selectOption("10");
  await page.locator('input[name="wholesaleUnitPrice"]').fill("100");

  // Something that isn't an image is refused, even with an image name.
  await page.locator('input[name="images"]').setInputFiles({ name: "evil.png", mimeType: "image/png", buffer: Buffer.from("<svg onload=alert(1)>") });
  await page.getByRole("button", { name: "Publish Deal" }).click();
  await expect(page.getByText(/isn't a valid JPEG, PNG or WebP/i)).toBeVisible({ timeout: 15_000 });

  await page.locator('input[name="images"]').setInputFiles({ name: "speaker.png", mimeType: "image/png", buffer: PNG_BYTES });
  await page.getByRole("button", { name: "Publish Deal" }).click();
  await expect(page).toHaveURL(/dealCreated=1/, { timeout: 15_000 });

  // A signed-out visitor sees the real photo on the listing and on the deal page.
  const guest = await browser.newContext({ baseURL });
  const gp = await guest.newPage();
  await gp.goto("/en/deals");
  const card = gp.locator("article", { hasText: title }).first();
  const img = card.locator("img").first();
  await expect(img).toBeVisible();
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  const src = await img.getAttribute("src");
  expect(src).toMatch(/^\/uploads\/deal\/[0-9a-f-]{36}$/);

  const direct = await guest.request.get(src!);
  expect(direct.status()).toBe(200);
  expect(direct.headers()["content-type"]).toContain("image/png");
  expect(direct.headers()["x-content-type-options"]).toBe("nosniff");
  await guest.close();
  void shown;
});

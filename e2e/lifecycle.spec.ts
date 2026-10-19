import { expect, test } from "@playwright/test";
import { shown, createVerifiedMerchant, joinDeal, loginAndWait, logout, publishDeal, signupCustomer, sql, uniqueEmail } from "./helpers";

// The whole money path: 5 units are bought, the cycle closes (the scheduler runs
// every minute), the buyers pay the rest, the merchant delivers.
test("a deal that reaches 5 units closes, is paid in full and delivered", async ({ page }) => {
  test.setTimeout(6 * 60_000);
  const title = `E2E Lifecycle ${Date.now().toString(36)}`;

  const merchantEmail = await createVerifiedMerchant(page, "Lifecycle Shop"); // stays signed in
  const dealId = await publishDeal(page, title, 10, 200);
  await logout(page);

  // 2 + 2 + 1 units from three different customers (max 2 units each).
  const buyers: string[] = [];
  for (const units of [2, 2, 1]) {
    const email = uniqueEmail("buyer");
    await signupCustomer(page, email);
    await joinDeal(page, dealId, units);
    buyers.push(email);
    await logout(page);
  }

  // Fast-forward the cycle's clock; the scheduler picks it up within a minute.
  sql(`update cycles set ends_at = now() - interval '1 minute' where deal_id = '${dealId}' and status = 'active'`);

  await loginAndWait(page, buyers[0]);
  await expect(async () => {
    await page.goto("/en/orders");
    await expect(page.getByRole("button", { name: "Pay the rest" }).locator("visible=true").first()).toBeVisible({ timeout: 3000 });
  }).toPass({ timeout: 150_000, intervals: [10_000] });
  await page.getByRole("button", { name: "Pay the rest" }).locator("visible=true").first().click();
  await expect(shown(page, "Running")).toBeVisible({ timeout: 15_000 });
  await logout(page);

  // The merchant sees the paid order with the delivery details, and marks it delivered.
  await loginAndWait(page, merchantEmail);
  await page.goto("/en/merchant/dashboard");
  await expect(shown(page, "Ready to deliver")).toBeVisible();
  await expect(page.getByTestId("delivery-details").locator("visible=true").first()).toContainText("01012345678");
  await page.getByRole("button", { name: "Mark delivered" }).locator("visible=true").first().click();
  await expect(shown(page, /Inspection window/)).toBeVisible({ timeout: 15_000 });
  await logout(page);

  await loginAndWait(page, buyers[0]);
  await page.goto("/en/orders");
  await expect(shown(page, "Delivered")).toBeVisible();
});

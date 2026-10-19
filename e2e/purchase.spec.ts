import { expect, test } from "@playwright/test";
import { shown, createVerifiedMerchant, joinDeal, logout, publishDeal, signupCustomer, uniqueEmail } from "./helpers";

test("merchant publishes a deal, a customer joins it, then cancels for a full refund", async ({ page }) => {
  const title = `E2E Speaker ${Date.now().toString(36)}`;

  // Merchant: self-signup, approved (database flip), publishes through the form.
  // (Signing up leaves them signed in, so no separate login.)
  await createVerifiedMerchant(page, "E2E Shop");
  const dealId = await publishDeal(page, title);
  expect(dealId).toMatch(/^[0-9a-f-]{36}$/);
  await expect(shown(page, title)).toBeVisible();
  await logout(page);

  // The deal is public and shows its price tiers.
  await page.goto("/en/deals");
  await expect(shown(page, title)).toBeVisible();
  await page.goto(`/en/deals/${dealId}`);
  await expect(page.getByRole("link", { name: "Join now" }).first()).toBeVisible();

  // Customer joins through checkout and sees the order.
  await signupCustomer(page, uniqueEmail("buyer"));
  await joinDeal(page, dealId, 1);
  await expect(shown(page, title)).toBeVisible();
  await expect(shown(page, "Running")).toBeVisible();

  // Cancelling inside the 24h window refunds the deposit.
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Cancel", exact: true }).locator("visible=true").first().click();
  await expect(shown(page, "Cancelled")).toBeVisible({ timeout: 15_000 });
});

test("a merchant who isn't approved yet can't publish", async ({ page }) => {
  const email = uniqueEmail("pending");
  await page.goto("/en/merchant/signup");
  await page.locator('input[name="business_name"]').fill("Pending Shop");
  await page.locator('input[name="owner_name"]').fill("Pat");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill("Passw0rd!x");
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page).toHaveURL(/submitted=1/, { timeout: 15_000 });

  await page.goto("/en/merchant/deals/new");
  await page.locator('input[name="title"]').fill("Should not publish");
  await page.locator('select[name="totalStock"]').selectOption("5");
  await page.locator('input[name="wholesaleUnitPrice"]').fill("50");
  await page.getByRole("button", { name: "Publish Deal" }).click();
  await expect(page.getByText(/isn't verified yet|needs to approve/i)).toBeVisible();
});

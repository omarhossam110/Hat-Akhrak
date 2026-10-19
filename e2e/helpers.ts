import { execSync } from "node:child_process";
import { expect, type Page } from "@playwright/test";

export const PASSWORD = "Passw0rd!x";
const run = Date.now().toString(36);
let counter = 0;
export const uniqueEmail = (prefix: string) => `${prefix}-${run}-${++counter}@e2e.test`;

/** Runs SQL against the app's database (see playwright.config.ts). */
export function sql(statement: string): string {
  const exec = process.env.E2E_DB_EXEC;
  if (!exec) throw new Error("Set E2E_DB_EXEC (a command that runs SQL from stdin) — see e2e/README.md");
  return execSync(exec + " -v ON_ERROR_STOP=1 -tA", { input: statement, encoding: "utf8" }).trim();
}

/** The backend limits sign-ups/logins to 10 a minute per IP; a whole suite from one IP can brush it. */
async function submitWithRateLimitRetry(page: Page, submit: () => Promise<void>, failText: RegExp) {
  for (let attempt = 0; attempt < 4; attempt++) {
    await submit();
    const limited = await page.getByText(failText).first().isVisible({ timeout: 4000 }).catch(() => false);
    if (!limited) return;
    await page.waitForTimeout(20_000);
  }
}

/** "My Orders" is in the nav for guests too; the Log Out button only exists once signed in. */
export const logoutButton = (page: Page) => page.locator("header").getByRole("button", { name: /^Log out/i }).first();
export async function expectSignedIn(page: Page) {
  await expect(logoutButton(page)).toBeVisible({ timeout: 15_000 });
}

export async function signupCustomer(page: Page, email = uniqueEmail("cust"), name = "Test Customer") {
  await page.goto("/en/signup");
  await page.locator('input[name="name"]').fill(name);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await submitWithRateLimitRetry(page, () => page.getByRole("button", { name: "Create Account" }).click(), /too many/i);
  await expectSignedIn(page);
  return email;
}

export async function login(page: Page, email: string, password = PASSWORD) {
  await page.goto("/en/login");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await submitWithRateLimitRetry(page, () => page.getByRole("button", { name: "Log In" }).last().click(), /too many/i);
}

/** login() followed by waiting until the session really exists. */
export async function loginAndWait(page: Page, email: string) {
  await login(page, email);
  await expectSignedIn(page);
}

export async function logout(page: Page) {
  await logoutButton(page).click();
  await expect(page.getByRole("link", { name: "Log In" }).first()).toBeVisible({ timeout: 15_000 });
}

/** Self-service merchant signup, then the database flip a super admin would do. */
export async function createVerifiedMerchant(page: Page, businessName: string) {
  const email = uniqueEmail("merchant");
  await page.goto("/en/merchant/signup");
  await page.locator('input[name="business_name"]').fill(businessName);
  await page.locator('input[name="owner_name"]').fill("Mona Owner");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await submitWithRateLimitRetry(page, () => page.getByRole("button", { name: "Submit application" }).click(), /too many/i);
  await expect(page).toHaveURL(/submitted=1/, { timeout: 15_000 });
  sql(`update merchants set is_verified = true where user_id = (select id from profiles where email = '${email}')`);
  return email;
}

/** Publishes a deal through the form and returns its id (found via the public listing). */
export async function publishDeal(page: Page, title: string, stock = 10, price = 100) {
  await page.goto("/en/merchant/deals/new");
  await page.locator('input[name="title"]').fill(title);
  const category = page.locator('select[name="categoryId"]');
  if (await category.count()) await category.selectOption({ index: 1 }).catch(() => undefined);
  await page.locator('select[name="totalStock"]').selectOption(String(stock));
  await page.locator('input[name="wholesaleUnitPrice"]').fill(String(price));
  await page.getByRole("button", { name: "Publish Deal" }).click();
  await expect(page).toHaveURL(/dealCreated=1/, { timeout: 15_000 });
  return sql(`select id from deals where title = '${title}' order by created_at desc limit 1`);
}

/** Customer joins a deal for `units` units through the real checkout form. */
export async function joinDeal(page: Page, dealId: string, units = 1) {
  await page.goto(`/en/payment/${dealId}?qty=${units}`);
  await page.locator('input[name="deliveryName"]').fill("Test Customer");
  await page.locator('input[name="deliveryPhone"]').fill("01012345678");
  await page.locator('select[name="deliveryGovernorate"]').selectOption({ index: 1 });
  await page.locator('input[name="deliveryCity"]').fill("Nasr City");
  await page.locator('textarea[name="deliveryAddress"]').fill("12 Test Street, Building 4, Apt 9");
  await page.getByRole("button", { name: /Pay now/ }).click();
  await expect(page).toHaveURL(/\/orders/, { timeout: 20_000 });
}

/** Orders/dashboard render a phone card AND a desktop table row; this is the one that's actually shown. */
export const shown = (page: Page, text: string | RegExp) => page.getByText(text).locator("visible=true").first();

/** A valid 1x1 PNG, for upload tests. */
export const PNG_BYTES = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

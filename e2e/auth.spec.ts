import { expect, test } from "@playwright/test";
import { expectSignedIn, login, logout, signupCustomer, uniqueEmail, PASSWORD } from "./helpers";

test("a guest is sent to log in, and back to where they were headed", async ({ page }) => {
  await page.goto("/en/orders");
  await expect(page).toHaveURL(/\/login\?redirect=/);
});

test("sign up, sign out, a wrong password is refused, the right one works", async ({ page }) => {
  const email = await signupCustomer(page);
  await logout(page);

  await login(page, email, "definitely-wrong-1");
  await expect(page.getByText(/incorrect|invalid|wrong/i).first()).toBeVisible();
  await expect(page).toHaveURL(/\/login/);

  await login(page, email, PASSWORD);
  await expectSignedIn(page);
});

test("the same email can't sign up twice", async ({ page, browser }) => {
  const email = await signupCustomer(page);
  // A fresh browser (the first one is signed in and would be redirected away from /signup).
  const second = await (await browser.newContext()).newPage();
  await second.goto("/en/signup");
  await second.locator('input[name="name"]').fill("Dup");
  await second.locator('input[name="email"]').fill(email);
  await second.locator('input[name="password"]').fill(PASSWORD);
  await second.getByRole("button", { name: "Create Account" }).click();
  await expect(second.getByText(/already/i).first()).toBeVisible();
  await second.context().close();
});

test("customers can't open merchant or admin pages", async ({ page }) => {
  await signupCustomer(page, uniqueEmail("plain"));
  await page.goto("/en/merchant/dashboard");
  await expect(page).not.toHaveURL(/merchant\/dashboard/);
  await page.goto("/en/super-admin");
  await expect(page).not.toHaveURL(/super-admin$/);
});

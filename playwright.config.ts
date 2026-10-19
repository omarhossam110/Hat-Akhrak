import { defineConfig } from "@playwright/test";

// End-to-end tests drive a RUNNING site (production build + backend + database).
//   BASE_URL     where the site is (default http://localhost:3000)
//   E2E_DB_EXEC  a shell command that runs SQL from stdin against the app's
//                database, e.g. `psql postgresql://user:pw@localhost/db` or
//                `docker compose -f deploy/docker-compose.yml exec -T db psql -U hat -d hat_akhrak`
//                (used only to do what no screen can: verify a merchant,
//                fast-forward a cycle's clock).
// See e2e/README.md.
export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 10_000 },
  // Tests share one database and the backend's per-IP rate limits: run one at a time.
  workers: 1,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    locale: "en-US",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});

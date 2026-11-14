import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const API_PORT = 3101;
const DOWN_PORT = 3102;
const MOCK_POS_PORT = 4010;

/**
 * Browser tests run against a production build (`npm run build` first), because the
 * catalogue hydrates behind Suspense and dev-mode HMR makes timing unreliable.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } } },
  ],
  webServer: [
    // Default (fixture) catalogue: the original demo storefront.
    {
      command: `npm run start -- -p ${PORT}`,
      url: `http://localhost:${PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    // Controlled stand-in for the POS catalog API (browser tests only).
    {
      command: "node tests/e2e/support/mock-pos.mjs",
      url: `http://127.0.0.1:${MOCK_POS_PORT}/__health`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    // Same build, API catalogue source pointed at the controlled backend.
    {
      command: `npm run start -- -p ${API_PORT}`,
      url: `http://localhost:${API_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { MERCHANTOS_CATALOG_SOURCE: "api", MERCHANTOS_CATALOG_API_URL: `http://127.0.0.1:${MOCK_POS_PORT}` },
    },
    // Same build, API catalogue source pointed at a port with nothing listening (outage).
    {
      command: `npm run start -- -p ${DOWN_PORT}`,
      url: `http://localhost:${DOWN_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { MERCHANTOS_CATALOG_SOURCE: "api", MERCHANTOS_CATALOG_API_URL: "http://127.0.0.1:4019", MERCHANTOS_CATALOG_API_TIMEOUT_MS: "1000" },
    },
  ],
});

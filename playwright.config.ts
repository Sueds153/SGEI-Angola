import { defineConfig, devices } from "@playwright/test";

/**
 * Auditoria de produção do ImportEasy.
 * Os testes correm contra o deploy de produção, por isso são executados em série
 * (um worker) para não concorrerem entre si nem com o rate limiter do login.
 */
export default defineConfig({
  testDir: "./tests",
  testIgnore: [
    "**/debug-*.spec.ts",
    "**/screenshot-all.spec.ts",
    "**/visual-diagnostic.spec.ts",
    "**/auth-setup.spec.ts",
  ],
  timeout: 120_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 1,
  forbidOnly: !!process.env.CI,
  reporter: [["list"]],
  use: {
    baseURL: "https://importeasy-angola.vercel.app",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    actionTimeout: 20_000,
    navigationTimeout: 60_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

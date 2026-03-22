import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e/integration',
  fullyParallel: false,   // tests share a DB — run serially
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  timeout: 60000,         // AI calls in beforeAll can be slow
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,  // run `npm run dev` from root before these tests
    timeout: 120000,
  },
})

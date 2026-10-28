import { defineConfig, devices } from '@playwright/test';

const port = 3000;
const ci = Boolean(process.env.CI);

/**
 * End-to-end tests against the local Supabase with the dev seed (supabase/seeds/10_dev_data.sql).
 * Locally they reuse a running `pnpm dev`; in CI they start the production build.
 */
export default defineConfig({
  testDir: './e2e',
  workers: 1,
  forbidOnly: ci,
  retries: ci ? 1 : 0,
  reporter: ci ? [['github'], ['list']] : 'list',
  // Development mode compiles each page on first visit; on a busy machine that passes 5 s.
  expect: { timeout: 15_000 },
  timeout: ci ? 30_000 : 60_000,
  use: {
    baseURL: `http://localhost:${String(port)}`,
    locale: 'pt-BR',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], locale: 'pt-BR' } }],
  webServer: {
    command: ci
      ? `pnpm exec next start --port ${String(port)}`
      : `pnpm exec next dev --port ${String(port)}`,
    url: `http://localhost:${String(port)}`,
    reuseExistingServer: !ci,
    // In CI the server log goes to the job output (JSON lines with event codes, ADR 0022).
    stdout: ci ? 'pipe' : 'ignore',
    stderr: 'pipe',
    timeout: 120_000,
  },
});

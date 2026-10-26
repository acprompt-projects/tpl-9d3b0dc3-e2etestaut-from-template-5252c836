import { defineConfig, devices } from '@playwright/test';

const authBaseURL = process.env.AUTH_BASE_URL ?? 'http://localhost:3000';
const docsBaseURL = process.env.DOC_BASE_URL ?? 'http://localhost:3001';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'on-failure' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: 'auth',
      testMatch: /tests[\/\\]auth[\/\\].+\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: authBaseURL,
      },
    },
    {
      name: 'docs',
      testMatch: /tests[\/\\]docs[\/\\].+\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: docsBaseURL,
      },
    },
    {
      name: 'auth-mobile',
      testMatch: /tests[\/\\]auth[\/\\].+\.spec\.ts/,
      use: {
        ...devices['Pixel 7'],
        baseURL: authBaseURL,
      },
    },
  ],
});
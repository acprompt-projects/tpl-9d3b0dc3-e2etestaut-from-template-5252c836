import { expect, test, type Page } from "@playwright/test";

/**
 * Core authentication user journeys for the auth gateway.
 * Requires playwright.config baseURL and a seeded demo user
 * (override credentials via E2E_USER_EMAIL / E2E_USER_PASSWORD).
 */

const DEMO_USER = {
  email: process.env.E2E_USER_EMAIL ?? "demo@example.com",
  password: process.env.E2E_USER_PASSWORD ?? "DemoPass123!",
};

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
}

test.describe("Authentication gateway", () => {
  test("logs in with valid credentials and lands on the dashboard", async ({ page }) => {
    await login(page, DEMO_USER.email, DEMO_USER.password);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
  });

  test("rejects invalid credentials with an error message", async ({ page }) => {
    await login(page, DEMO_USER.email, "definitely-wrong-password");
    await expect(page.getByRole("alert")).toContainText(/invalid|incorrect/i);
    await expect(page).toHaveURL(/\/login/);
  });

  test("blocks protected routes for unauthenticated visitors", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("keeps the session after a full page reload", async ({ page }) => {
    await login(page, DEMO_USER.email, DEMO_USER.password);
    await expect(page).toHaveURL(/\/dashboard/);
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("logs out and returns to the login screen", async ({ page }) => {
    await login(page, DEMO_USER.email, DEMO_USER.password);
    await page.getByRole("button", { name: /log ?out|sign out/i }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("login form validates empty submissions", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("alert")).toBeVisible();
  });
});
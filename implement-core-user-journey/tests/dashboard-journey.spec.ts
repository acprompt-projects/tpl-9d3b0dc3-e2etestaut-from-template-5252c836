import { expect, test, type Page } from "@playwright/test";

/**
 * Authenticated user journey: dashboard navigation and core entity
 * (document) CRUD on the documentation portal.
 */

const DEMO_USER = {
  email: process.env.E2E_USER_EMAIL ?? "demo@example.com",
  password: process.env.E2E_USER_PASSWORD ?? "DemoPass123!",
};

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(DEMO_USER.email);
  await page.getByLabel(/password/i).fill(DEMO_USER.password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

const uniqueTitle = () => `E2E Doc ${Date.now()}`;

test.describe("Dashboard and document CRUD journey", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("dashboard renders primary navigation", async ({ page }) => {
    await expect(page.getByTestId("nav")).toBeVisible();
    await expect(page.getByRole("link", { name: /documents/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /settings/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /dashboard|welcome/i })).toBeVisible();
  });

  test("navigates from dashboard to the documents list", async ({ page }) => {
    await page.getByRole("link", { name: /documents/i }).click();
    await expect(page).toHaveURL(/\/documents/);
    await expect(page.getByRole("heading", { name: /documents/i })).toBeVisible();
    await expect(page.getByTestId("doc-row").first()).toBeVisible();
  });

  test("creates, edits, then deletes a document", async ({ page }) => {
    const title = uniqueTitle();
    const updated = `${title} (updated)`;

    // Create
    await page.goto("/documents");
    await page.getByRole("button", { name: /new document|create/i }).click();
    await page.getByLabel(/title/i).fill(title);
    await page.getByLabel(/body|content/i).fill("Initial content from e2e run.");
    await page.getByRole("button", { name: /^(save|create)$/i }).click();
    await expect(page.getByTestId("doc-row").filter({ hasText: title })).toBeVisible();

    // Edit
    await page
      .getByTestId("doc-row")
      .filter({ hasText: title })
      .getByRole("button", { name: /edit/i })
      .click();
    await page.getByLabel(/title/i).fill(updated);
    await page.getByLabel(/body|content/i).fill("Edited content from e2e run.");
    await page.getByRole("button", { name: /^save$/i }).click();
    await expect(page.getByTestId("doc-row").filter({ hasText: updated })).toBeVisible();

    // Delete
    await page
      .getByTestId("doc-row")
      .filter({ hasText: updated })
      .getByRole("button", { name: /delete|remove/i })
      .click();
    await page.getByRole("button", { name: /confirm|yes, delete/i }).click();
    await expect(page.getByTestId("doc-row").filter({ hasText: updated })).toHaveCount(0);
  });
});
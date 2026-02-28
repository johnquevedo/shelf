import { test, expect } from "@playwright/test";

test("seeded user can log in from the landing modal", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Log in" }).click();
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await page.getByLabel("Email").fill("demo@shelf.app");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Log In" }).click();
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByRole("heading", { name: "Your Following" })).toBeVisible();
});

test("seeded user can comment and remove the comment without reloading", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Log in" }).click();
  await page.getByLabel("Email").fill("demo@shelf.app");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Log In" }).click();
  await expect(page).toHaveURL(/\/home$/);

  const firstReview = page.locator("article").first();
  await firstReview.getByRole("button", { name: "Open comments" }).click();
  await expect(page.getByRole("heading", { name: /Comments/ })).toBeVisible();

  const commentText = `E2E comment ${Date.now()}`;
  await page.getByPlaceholder("Write a thoughtful reply...").fill(commentText);
  await page.getByRole("button", { name: "Post comment" }).click();

  await expect(page.getByText(commentText)).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove" })).toBeVisible();
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByText(commentText)).not.toBeVisible();
});

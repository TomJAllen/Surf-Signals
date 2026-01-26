import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("landing page has all navigation elements", async ({ page }) => {
    await page.goto("/");

    // Logo and brand
    await expect(page.getByText("SURF LIFE SAVING AUSTRALIA")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Surf Signals" })).toBeVisible();

    // CTAs
    await expect(page.getByRole("link", { name: "Get Started Free" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();

    // Features
    await expect(page.getByText("Identify Mode")).toBeVisible();
    await expect(page.getByText("Perform Mode")).toBeVisible();
    await expect(page.getByText("Track Progress")).toBeVisible();

    // Categories
    await expect(page.getByText("Water Signals")).toBeVisible();
    await expect(page.getByText("Land Signals")).toBeVisible();
    await expect(page.getByText("IRB Signals")).toBeVisible();
  });

  test("can navigate from landing to signup", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Get Started Free" }).click();

    await expect(page).toHaveURL("/signup");
    await expect(page.getByText("Create your account")).toBeVisible();
  });

  test("can navigate from landing to login", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Sign In" }).first().click();

    await expect(page).toHaveURL("/login");
    await expect(page.getByText("Sign in to your account")).toBeVisible();
  });

  test("navbar shows correct links for anonymous users", async ({ page }) => {
    await page.goto("/study/identify");

    // Should have limited nav items
    await expect(page.getByRole("link", { name: "Identify" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Perform" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
  });
});

test.describe("Mobile Navigation", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("mobile menu works", async ({ page }) => {
    await page.goto("/study/identify");

    // Menu button should be visible on mobile
    const menuButton = page.locator("button").filter({ has: page.locator("svg") }).first();
    await expect(menuButton).toBeVisible();
  });
});

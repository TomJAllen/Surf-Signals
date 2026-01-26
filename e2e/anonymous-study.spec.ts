import { test, expect } from "@playwright/test";

test.describe("Anonymous Study Flow", () => {
  test("can access landing page", async ({ page }) => {
    await page.goto("/");

    // Should see the landing page
    await expect(page.getByText("Surf Signals")).toBeVisible();
    await expect(page.getByText("Get Started Free")).toBeVisible();
  });

  test("can access identify mode without login", async ({ page }) => {
    await page.goto("/study/identify");

    // Should see the session setup
    await expect(page.getByText("Set Up Your Session")).toBeVisible();
    await expect(page.getByText("Identify Mode")).toBeVisible();
  });

  test("can access perform mode without login", async ({ page }) => {
    await page.goto("/study/perform");

    // Should see the session setup
    await expect(page.getByText("Set Up Your Session")).toBeVisible();
    await expect(page.getByText("Perform Mode")).toBeVisible();
  });

  test("dashboard requires authentication", async ({ page }) => {
    await page.goto("/dashboard");

    // Should see the sign-in prompt
    await expect(page.getByText("Sign In Required")).toBeVisible();
  });

  test("can start an identify session", async ({ page }) => {
    await page.goto("/study/identify");

    // Select count and start
    await page.getByRole("button", { name: /5\s*signals/i }).click();
    await page.getByRole("button", { name: "Start Session" }).click();

    // Should see the flashcard
    await expect(page.getByText("What signal is this?")).toBeVisible();
    await expect(page.getByText("Signal 1 of 5")).toBeVisible();
  });

  test("can filter by category", async ({ page }) => {
    await page.goto("/study/identify");

    // Click Water category
    await page.getByRole("button", { name: /Water/i }).click();

    // The button should be selected (blue background)
    const waterButton = page.getByRole("button", { name: /Water/i });
    await expect(waterButton).toHaveClass(/bg-blue-500/);
  });

  test("shows sign-in prompt banner for anonymous users", async ({ page }) => {
    await page.goto("/study/identify");

    // Should see the prompt to create account
    await expect(
      page.getByText("Want to save your progress?")
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Create Account" })).toBeVisible();
  });
});

test.describe("Session Flow", () => {
  test("completes a full session and shows summary", async ({ page }) => {
    await page.goto("/study/identify");

    // Start a session with minimum signals
    await page.getByRole("button", { name: /5\s*signals/i }).click();
    await page.getByRole("button", { name: "Start Session" }).click();

    // Complete 5 signals
    for (let i = 0; i < 5; i++) {
      // Reveal answer
      await page.getByRole("button", { name: "Reveal Answer" }).click();

      // Mark as correct (use exact match to avoid matching "Incorrect")
      await page.getByRole("button", { name: "Correct", exact: true }).click();

      // Click next (unless it's the last one)
      if (i < 4) {
        await page.getByRole("button", { name: "Next Signal" }).click();
      }
    }

    // Should see session summary
    await page.getByRole("button", { name: "Next Signal" }).click();
    await expect(page.getByText("Session Complete")).toBeVisible();
    await expect(page.getByText("100%")).toBeVisible(); // Perfect score
  });
});

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

    // Start session (no count selector — uses all signals)
    await page.getByRole("button", { name: "Start Session" }).click();

    // Should see the flashcard
    await expect(page.getByText("What signal is this?")).toBeVisible();
    await expect(page.getByText(/Signal 1 of \d+/)).toBeVisible();
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

    // Select a category to limit signal count, then start
    await page.getByRole("button", { name: /Water to Beach/i }).click();
    await page.getByRole("button", { name: "Start Session" }).click();

    // Wait for the first flashcard to appear
    await expect(page.getByText("What signal is this?")).toBeVisible();

    // Read total from the progress indicator
    const progressText = await page.getByText(/Signal 1 of \d+/).textContent();
    const totalSignals = parseInt(progressText!.match(/of (\d+)/)![1], 10);

    // Complete all signals in the category
    for (let i = 0; i < totalSignals; i++) {
      // Reveal answer
      await page.getByRole("button", { name: "Reveal Answer" }).click();

      // Mark as correct (use exact match to avoid matching "Incorrect")
      await page.getByRole("button", { name: "Correct", exact: true }).click();

      // Click next
      await page.getByRole("button", { name: "Next Signal" }).click();
    }

    // Should see session summary
    await expect(page.getByText("Session Complete")).toBeVisible();
    await expect(page.getByText("100%")).toBeVisible(); // Perfect score
  });
});

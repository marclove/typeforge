import { expect, test } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  const content = await page.textContent("#output");
  expect(content).toBeTruthy();
});

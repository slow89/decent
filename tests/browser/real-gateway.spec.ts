import { expect, test } from "./fixtures";

test.describe("real gateway smoke", () => {
  test.skip(!process.env.PLAYWRIGHT_REAL_GATEWAY_URL, "PLAYWRIGHT_REAL_GATEWAY_URL is required");

  test("loads the shell against a real gateway target", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Brew" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Setup" })).toBeVisible();
  });
});

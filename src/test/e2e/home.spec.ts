import { expect, test } from "@playwright/test";

test("home page leads with the headline and its calls to action", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "Make room for the Word." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse sermons" })).toHaveAttribute("href", "/sermons");
});

test("serves the PWA manifest", async ({ request }) => {
  const response = await request.get("/manifest.webmanifest");

  expect(response.ok()).toBe(true);
  expect((await response.json()).name).toBe("GodsWheel");
});

import { expect, test } from "@playwright/test";

test("home page renders", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Godswheel" })).toBeVisible();
});

test("serves the PWA manifest", async ({ request }) => {
  const response = await request.get("/manifest.webmanifest");

  expect(response.ok()).toBe(true);
  expect((await response.json()).name).toBe("Godswheel");
});

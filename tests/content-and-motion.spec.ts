import { test, expect } from "@playwright/test";

test("outfit moods animate, support keyboard selection, and survive reload", async ({
  page,
}) => {
  await page.goto("/");
  const city = page.getByRole("tab", { name: /Out in the city/ });
  await city.click();
  await expect(city).toHaveAttribute("aria-selected", "true");
  await expect(page).toHaveURL(/mood=city/);
  await expect(
    page.getByRole("tabpanel").getByRole("link", { name: /The City Layer/ }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("tab", { name: /Out in the city/ }),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: /Out in the city/ }).press("ArrowDown");
  await expect(
    page.getByRole("tab", { name: /A brighter mood/ }),
  ).toHaveAttribute("aria-selected", "true");
});
test("motion can be paused and device reduced-motion settings are honored", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator(".motion-band").scrollIntoViewIfNeeded();
  const scroller = page.locator(".motion-band .scroller");
  const first = await scroller.getAttribute("style");
  await expect.poll(() => scroller.getAttribute("style")).not.toBe(first);
  await page
    .getByRole("button", { name: "Pause animations", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Play animations", exact: true }),
  ).toBeVisible();
  const paused = await scroller.getAttribute("style");
  await page.waitForTimeout(180);
  expect(await scroller.getAttribute("style")).toBe(paused);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    page.getByRole("button", {
      name: "Motion disabled by your device settings",
    }),
  ).toBeDisabled();
});
test("journal content and photo credits are connected", async ({ page }) => {
  await page.goto("/journal/a-little-orange");
  await expect(
    page.getByRole("heading", { name: "A little orange goes a long way." }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Photography credits", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Photography.", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Pexels License/ }),
  ).toHaveAttribute("href", "https://www.pexels.com/license/");
});

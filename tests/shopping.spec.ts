import { test, expect } from "@playwright/test";

test("choose a size, persist a bag, switch currency, and submit an unpaid order", async ({
  page,
}) => {
  await page.goto("/products/daily-hoodie");
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "Choose your size first.",
  );
  await page.getByRole("radio", { name: "M", exact: true }).check();
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await page.getByLabel("Shopping currency").selectOption("USD");
  await page
    .getByRole("link", { name: "Shopping bag, 1 item", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "Your bag." })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Shopping currency")).toHaveValue("USD");
  await expect(
    page.getByRole("heading", { name: "The Daily Hoodie" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Continue to checkout" }).click();
  await page.getByLabel("Full name").fill("FORME Browser Test");
  await page.getByLabel("Email address").fill("browser-test@example.com");
  await page.getByLabel("Street address").fill("12 Test Collection Street");
  await page.getByLabel("City", { exact: true }).fill("Lagos");
  await page
    .getByLabel("Country", { exact: true })
    .selectOption({ label: "Nigeria" });
  await page.getByRole("button", { name: /Place demo order/ }).click();
  await expect(
    page.getByRole("heading", { name: "Looking good." }),
  ).toBeVisible();
  await expect(page.getByText("Demo order", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Shopping bag, 0 items", exact: true }),
  ).toBeVisible();
});

test("category filters survive reload and unknown searches have a recovery link", async ({
  page,
}) => {
  await page.goto("/shop?category=Footwear");
  await expect(
    page.getByRole("link", { name: "View Canvas High 01", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "View The Daily Hoodie", exact: true }),
  ).toHaveCount(0);
  await page.getByLabel("Search the collection").fill("no-matching-product");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "No pieces found." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "View all pieces" }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Search the collection")).toHaveValue(
    "no-matching-product",
  );
});

test("homepage fits the viewport and all product media load", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "FIND YOUR FORM." }),
  ).toBeVisible();
  await page
    .getByRole("heading", { name: "Everyday favorites." })
    .scrollIntoViewIfNeeded();
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate(
          (element) =>
            (element as HTMLImageElement).complete &&
            (element as HTMLImageElement).naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

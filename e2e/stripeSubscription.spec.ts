import { expect, test, type Page } from "@playwright/test";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const TEST_EMAIL = "stripe@test.com";

function getConvex() {
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
}

async function cleanup() {
  const convex = getConvex();
  await convex.action(api.testing.stripe.cancelTestSubscription, {
    email: TEST_EMAIL,
  });
  await convex.mutation(api.testing.functions.clearTestData, {
    email: TEST_EMAIL,
  });
}

test.describe.serial("stripe subscription flow", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    await cleanup();
    page = await browser.newPage();
    await page.context().clearCookies();
    await page.goto("/test-auth");
    await page.evaluate(() => localStorage.clear());
    await page.getByTestId("test-auth-email").fill(TEST_EMAIL);
    await page.getByTestId("test-auth-submit").click();

    await expect(page.getByText("Wie heißt dein Verein?")).toBeVisible({
      timeout: 10000,
    });
    await page
      .getByRole("textbox", { name: "Wie heißt dein Verein?" })
      .fill("Test Verein");
    await page.getByRole("button", { name: "Loslegen" }).click();
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();
  });

  test.afterAll(async () => {
    await cleanup();
    await page.close();
  });

  test("1. Subscribe to yearly plan", async () => {
    await page.getByRole("button", { name: "T Test User" }).click();
    await page.getByRole("menuitem", { name: "YBudget Premium" }).click();

    await expect(page.getByText("Ich hoffe YBudget gefällt dir")).toBeVisible();
    await page.getByRole("button", { name: "Auf YBudget Yearly upgraden" }).click();

    await expect(page.getByText("Sandbox", { exact: true })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.locator("#payment-form")).toContainText(TEST_EMAIL);

    await page.getByTestId("card-accordion-item-button").click();
    await page.getByRole("textbox", { name: "Card number" }).fill("4242424242424242");
    await page.getByRole("textbox", { name: "Expiration" }).fill("12 / 50");
    await page.getByRole("textbox", { name: "CVC" }).fill("123");
    await page.getByRole("textbox", { name: "Cardholder name" }).fill("Automated Test");
    await page.getByTestId("hosted-payment-submit-button").click();

    await expect(page.getByRole("heading", { name: "Vielen Dank" })).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole("link", { name: "Zurück zur App" }).click();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    await page.getByRole("button", { name: "T Test User" }).click();
    await expect(page.getByRole("group")).toContainText("Abrechnung");
  });

  test("2. Cancel subscription via billing portal", async () => {
    await page.getByRole("button", { name: "T Test User" }).click();
    await page.getByRole("menuitem", { name: "Abrechnung" }).click();

    await expect(page.getByText("Current subscription")).toBeVisible({
      timeout: 15000,
    });

    await page.locator("[data-test=\"cancel-subscription\"]").click();
    await expect(page.getByText("Confirm cancellation")).toBeVisible();
    await page.getByTestId("confirm").click();

    await page.locator("[data-test=\"cancel-reason-opt-other\"]").check();
    await page.getByRole("textbox", { name: "Any additional feedback?" }).fill("Automated test");
    await page.getByTestId("cancellation_reason_submit").click();

    await expect(page.getByTestId("page-container-main")).toContainText("Expires");
  });
});

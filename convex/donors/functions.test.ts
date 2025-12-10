import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

test("create donor", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupTestData(t);

  const donorId = await t
    .withIdentity({ subject: userId })
    .mutation(api.donors.functions.createDonor, {
      name: "Test Donor",
      type: "sponsoring",
      allowedTaxSpheres: ["non-profit"],
    });

  const donor = await t.run((ctx) => ctx.db.get(donorId));
  expect(donor?.name).toBe("Test Donor");
});

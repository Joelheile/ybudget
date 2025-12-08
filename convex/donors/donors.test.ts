import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

test("get all donors", async () => {
  const test = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(test);

  await test.run(async (ctx) => {
    await ctx.db.insert("donors", {
      name: "Test Donor",
      type: "donation",
      allowedTaxSpheres: ["non-profit"],
      organizationId,
      createdBy: userId,
    });
  });

  const user = test.withIdentity({ subject: userId });
  const donors = await user.query(api.donors.queries.getAllDonors, {});
  expect(donors).toHaveLength(1);
  expect(donors[0].name).toBe("Test Donor");
});

test("create a new donor", async () => {
  const test = convexTest(schema, modules);
  const { userId } = await setupTestData(test);

  const user = test.withIdentity({ subject: userId });
  const donorId = await user.mutation(api.donors.functions.createDonor, {
    name: "New Donor",
    type: "sponsoring",
    allowedTaxSpheres: ["non-profit"],
  });

  const donor = await test.run(async (ctx) => ctx.db.get(donorId));
  expect(donor?.name).toBe("New Donor");
  expect(donor?.type).toBe("sponsoring");
});

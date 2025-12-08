import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

test("get organization name", async () => {
  const test = convexTest(schema, modules);
  const { userId } = await setupTestData(test);
  const name = await test.withIdentity({ subject: userId }).query(api.organizations.queries.getOrganizationName, {});
  expect(name).toBe("Test Organization");
});

test("get user organization", async () => {
  const test = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(test);
  const org = await test.withIdentity({ subject: userId }).query(api.organizations.queries.getUserOrganization, {});
  expect(org?._id).toBe(organizationId);
  expect(org?.domain).toBe("test.com");
});

test("create organization", async () => {
  const test = convexTest(schema, modules);
  const userId = await test.run(async (ctx) => ctx.db.insert("users", { email: "new@test.com" }));
  const orgId = await test.mutation(api.organizations.functions.createOrganization, {
    name: "New Org",
    domain: "test.com",
    userId,
  });
  const org = await test.run(async (ctx) => ctx.db.get(orgId));
  expect(org?.name).toBe("New Org");
  const projects = await test.run(async (ctx) =>
    ctx.db.query("projects").withIndex("by_organization", (q) => q.eq("organizationId", orgId)).collect()
  );
  expect(projects).toHaveLength(1);
  expect(projects[0].name).toBe("Rücklagen");
});

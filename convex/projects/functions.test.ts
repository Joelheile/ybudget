import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

test("create project", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupTestData(t);

  const projectId = await t
    .withIdentity({ subject: userId })
    .mutation(api.projects.functions.createProject, { name: "New Project" });

  const project = await t.run((ctx) => ctx.db.get(projectId));
  expect(project?.name).toBe("New Project");
});

test("archive project", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  await t
    .withIdentity({ subject: userId })
    .mutation(api.projects.functions.archiveProject, { projectId });

  const project = await t.run((ctx) => ctx.db.get(projectId));
  expect(project?.isArchived).toBe(true);
});


test("rename project", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  await t
    .withIdentity({ subject: userId })
    .mutation(api.projects.functions.renameProject, { projectId, name: "Renamed" });

  const project = await t.run((ctx) => ctx.db.get(projectId));
  expect(project?.name).toBe("Renamed");
});

test("create project throws error if free tier limit is reached", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(t);

  for (let i = 0; i < 9; i++) {
    await t.run((ctx) =>
      ctx.db.insert("projects", {
        name: `Project ${i}`,
        organizationId,
        isArchived: false,
        createdBy: userId,
      }),
    );
  }

  await expect(
    t
      .withIdentity({ subject: userId })
      .mutation(api.projects.functions.createProject, { name: "Eleventh" }),
  ).rejects.toThrow("Limit");
});

test("create project works if user has premium", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(t);

  for (let i = 0; i < 9; i++) {
    await t.run((ctx) =>
      ctx.db.insert("projects", {
        name: `Project ${i}`,
        organizationId,
        isArchived: false,
        createdBy: userId,
      }),
    );
  }

  await t.run((ctx) =>
    ctx.db.insert("payments", {
      organizationId,
      status: "completed",
      tier: "yearly",
      stripeSubscriptionId: "sub_123",
    }),
  );

  const projectId = await t
    .withIdentity({ subject: userId })
    .mutation(api.projects.functions.createProject, { name: "Eleventh" });

  expect(projectId).toBeDefined();
});

test("rename project throws error when project is not found", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(t);

  const fakeProjectId = await t.run(async (ctx) => {
    const id = await ctx.db.insert("projects", {
      name: "Temp",
      organizationId,
      isArchived: false,
      createdBy: userId,
    });
    await ctx.db.delete(id);
    return id;
  });

  await expect(
    t
      .withIdentity({ subject: userId })
      .mutation(api.projects.functions.renameProject, {
        projectId: fakeProjectId,
        name: "New",
      }),
  ).rejects.toThrow("Project not found");
});

test("rename project throws error if project is not in user organization", async () => {
  const t = convexTest(schema, modules);
  const { userId } = await setupTestData(t);

  const otherOrgId = await t.run((ctx) =>
    ctx.db.insert("organizations", {
      name: "Other Org",
      domain: "other.com",
      createdBy: "system",
    }),
  );

  const otherProjectId = await t.run((ctx) =>
    ctx.db.insert("projects", {
      name: "Other Project",
      organizationId: otherOrgId,
      isArchived: false,
      createdBy: userId,
    }),
  );

  await expect(
    t
      .withIdentity({ subject: userId })
      .mutation(api.projects.functions.renameProject, {
        projectId: otherProjectId,
        name: "New",
      }),
  ).rejects.toThrow("Access denied");
});


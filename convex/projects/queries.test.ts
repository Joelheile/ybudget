import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

test("get all projects", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  const projects = await t
    .withIdentity({ subject: userId })
    .query(api.projects.queries.getAllProjects, {});

  expect(projects.find((p) => p._id === projectId)).toBeDefined();
});

test("get all projects returns empty object for unauthenticated user", async () => {
  const t = convexTest(schema, modules);
  await setupTestData(t);

  const projects = await t.query(api.projects.queries.getAllProjects, {});
  expect(projects).toHaveLength(0);
});

test("get all projects + archived project when 'includesArchived' is set ", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(t);

  await t.run((ctx) =>
    ctx.db.insert("projects", {
      name: "Archived Project",
      organizationId,
      isArchived: true,
      createdBy: userId,
    }),
  );

  const withArchived = await t
    .withIdentity({ subject: userId })
    .query(api.projects.queries.getAllProjects, { includeArchived: true });

  const withoutArchived = await t
    .withIdentity({ subject: userId })
    .query(api.projects.queries.getAllProjects, {});

  expect(withArchived.some((p) => p.name === "Archived Project")).toBe(true);
  expect(withoutArchived.some((p) => p.name === "Archived Project")).toBe(false);
});

test("get project by id", async () => {
  const t = convexTest(schema, modules);
  const { userId, projectId } = await setupTestData(t);

  const project = await t
    .withIdentity({ subject: userId })
    .query(api.projects.queries.getProjectById, { projectId });

  expect(project?._id).toBe(projectId);
});

test("return null as project for unauthenticated user", async () => {
  const t = convexTest(schema, modules);
  const { projectId } = await setupTestData(t);

  const project = await t.query(api.projects.queries.getProjectById, {
    projectId,
  });

  expect(project).toBeNull();
});

test("throw access when user has no access to get project by id", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, projectId } = await setupTestData(t);

  const memberUserId = await t.run((ctx) =>
    ctx.db.insert("users", {
      email: "member@test.com",
      organizationId,
      role: "member",
    }),
  );

  await expect(
    t
      .withIdentity({ subject: memberUserId })
      .query(api.projects.queries.getProjectById, { projectId }),
  ).rejects.toThrow("No access");
});

test("get departments returns all projects without parent projects", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(t);

  await t.run((ctx) =>
    ctx.db.insert("projects", {
      name: "Child",
      organizationId,
      parentId: projectId,
      isArchived: false,
      createdBy: userId,
    }),
  );

  const departments = await t
    .withIdentity({ subject: userId })
    .query(api.projects.queries.getDepartments, {});

  expect(departments.some((d) => d.name === "Child")).toBe(false);
});

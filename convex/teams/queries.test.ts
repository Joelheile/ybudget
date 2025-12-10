import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

test("return all teams of an organization", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(t);

  await t.run((ctx) =>
    ctx.db.insert("teams", {
      name: "Team A",
      organizationId,
      memberIds: [],
      projectIds: [],
      createdBy: userId,
    }),
  );

  const teams = await t
    .withIdentity({ subject: userId })
    .query(api.teams.queries.getAllTeams, {});

  expect(teams.length).toBeGreaterThanOrEqual(1);
});

test("getTeam returns team by id", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(t);

  const teamId = await t.run((ctx) =>
    ctx.db.insert("teams", {
      name: "My Team",
      organizationId,
      memberIds: [],
      projectIds: [],
      createdBy: userId,
    }),
  );

  const team = await t
    .withIdentity({ subject: userId })
    .query(api.teams.queries.getTeam, { teamId });

  expect(team?.name).toBe("My Team");
});

test("return all teams to which user belongs to", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId, projectId } = await setupTestData(t);

  await t.run((ctx) =>
    ctx.db.insert("teams", {
      name: "User Team",
      organizationId,
      memberIds: [userId],
      projectIds: [projectId],
      createdBy: userId,
    }),
  );

  const teams = await t
    .withIdentity({ subject: userId })
    .query(api.teams.queries.getUserTeams, { userId });

  expect(teams.length).toBeGreaterThanOrEqual(1);
  expect(teams[0].teamName).toBe("User Team");
  expect(teams[0].projectCount).toBe(1);
});

test("empty object if user is not in any team", async () => {
  const t = convexTest(schema, modules);
  const { organizationId, userId } = await setupTestData(t);

  const otherUserId = await t.run((ctx) =>
    ctx.db.insert("users", {
      email: "other@test.com",
      organizationId,
      role: "member",
    }),
  );

  await t.run((ctx) =>
    ctx.db.insert("teams", {
      name: "Team",
      organizationId,
      memberIds: [userId],
      projectIds: [],
      createdBy: userId,
    }),
  );

  const teams = await t
    .withIdentity({ subject: otherUserId })
    .query(api.teams.queries.getUserTeams, { userId: otherUserId });

  expect(teams).toHaveLength(0);
});

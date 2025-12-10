import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "../_generated/server";
import { getUserAccessibleProjectIds } from "../teams/permissions";
import { getCurrentUser } from "../users/getCurrentUser";

export const getAllProjects = query({
  args: { includeArchived: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await getCurrentUser(ctx);
    const accessibleIds = await getUserAccessibleProjectIds(
      ctx,
      user._id,
      user.organizationId,
    );

    let projects = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .collect();

    if (!args.includeArchived) {
      projects = projects.filter((p) => !p.isArchived);
    }

    return projects.filter((p) => accessibleIds.includes(p._id));
  },
});

export const getProjectById = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await getCurrentUser(ctx);
    const accessibleIds = await getUserAccessibleProjectIds(
      ctx,
      user._id,
      user.organizationId,
    );

    if (!accessibleIds.includes(args.projectId)) {
      throw new Error("No access to this project");
    }

    return await ctx.db.get(args.projectId);
  },
});

export const getDepartments = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return ctx.db
      .query("projects")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .filter((q) => q.eq(q.field("parentId"), undefined))
      .collect();
  },
});

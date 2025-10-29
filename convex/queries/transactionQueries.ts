import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthenticatedUser } from "../utils/auth";
import { createCategoryMap } from "../utils/categoryMapping";

export const getTransactions = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    projectId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) => q.eq("organizationId", user.organizationId))
      .filter(q => q.and(
        q.gte(q.field("date"), args.startDate),
        q.lte(q.field("date"), args.endDate)
      ))
      .collect();

    const projects = await ctx.db.query("projects").collect();
    
    const projectMap = new Map(projects.map(p => [p._id.toString(), p.name]));
    const categoryMap = createCategoryMap();

    let filtered = transactions;
    if (args.projectId) {
      filtered = transactions.filter(t => t.projectId === args.projectId);
    }

    return filtered.map(t => ({
      ...t,
      projectName: projectMap.get(t.projectId) || t.projectId,
      categoryName: categoryMap.get(t.categoryId) || t.categoryId,
    }));
  },
});

export const getAllTransactions = query({
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) => q.eq("organizationId", user.organizationId))
      .collect();
  },
});

export const getUnassignedProcessedTransactions = query({
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) => q.eq("organizationId", user.organizationId))
      .filter(q => q.and(
        q.eq(q.field("status"), "processed"),
        q.eq(q.field("projectId"), "")
      ))
      .collect();

    const categoryMap = createCategoryMap();

    return transactions.map(t => ({
      ...t,
      categoryName: categoryMap.get(t.categoryId) || t.categoryId,
    }));
  },
});

export const getExpectedTransactions = query({
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) => q.eq("organizationId", user.organizationId))
      .filter(q => q.eq(q.field("status"), "expected"))
      .collect();

    const projects = await ctx.db.query("projects").collect();
    const categoryMap = createCategoryMap();
    const projectMap = new Map(projects.map(p => [p._id.toString(), p.name]));

    return transactions.map(t => ({
      ...t,
      projectName: projectMap.get(t.projectId) || t.projectId,
      categoryName: categoryMap.get(t.categoryId) || t.categoryId,
    }));
  },
});
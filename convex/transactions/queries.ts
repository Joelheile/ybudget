import { v } from "convex/values";
import { query } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";
import { createCategoryMap } from "../utils/categoryMapping";

export const getAllTransactions = query({
  args: {
    projectId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    let dbQuery = ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      );

    if (args.projectId) {
      dbQuery = dbQuery.filter((q) => q.eq(q.field("projectId"), args.projectId));
    }

    const transactions = await dbQuery.collect();

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .collect();

    const projectMap = new Map(projects.map((p) => [p._id.toString(), p.name]));

    return transactions.map((transaction) => ({
      ...transaction,
      projectName:
        transaction.projectId && projectMap.has(transaction.projectId)
          ? projectMap.get(transaction.projectId)
          : transaction.projectId || "",
    }));
  },
});



// TODO: Simpler
export const getTransactionById = query({
  args: {
    transactionId: v.optional(v.id("transactions")),
    importedTransactionId: v.optional(v.string()),
  },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    let transaction;

    if (args.importedTransactionId) {
      transaction = await ctx.db
        .query("transactions")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", user.organizationId),
        )
        .filter((q) =>
          q.eq(q.field("importedTransactionId"), args.importedTransactionId),
        )
        .first();
    } else if (args.transactionId) {
      transaction = await ctx.db.get(args.transactionId);
    }

    return transaction;
  },
});

//TODO: simpler
export const getTransactionRecommendations = query({
  args: {
    amount: v.number(),
    projectId: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    let query = ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "expected"),
          q.neq(q.field("projectId"), ""),
          q.lt(q.field("amount"), 0),
        ),
      );

    const transactions = await query.collect();

    const unmatched = transactions.filter(
      (t) => !t.matchedTransactionId || t.matchedTransactionId === "",
    );

    const projects = await ctx.db.query("projects").collect();
    const projectMap = new Map(projects.map((p) => [p._id.toString(), p.name]));

    return unmatched.map((transaction) => ({
      ...transaction,
      projectName:
        projectMap.get(transaction.projectId) || transaction.projectId,
    }));
  },
});

export const getUnassignedProcessedTransactions = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "processed"),
          q.eq(q.field("projectId"), ""),
        ),
      )
      .collect();

    const unassignedTransactions = transactions.filter(
      (t) => !t.matchedTransactionId || t.matchedTransactionId === "",
    );

    const categoryMap = createCategoryMap();

    return unassignedTransactions.map((t) => ({
      ...t,
      categoryName: categoryMap.get(t.categoryId) || t.categoryId,
    }));
  },
});

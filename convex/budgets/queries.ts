import { v } from "convex/values";
import { query } from "../_generated/server";
import { getCurrentUser } from "../users";

export const getAllocatedBudget = query({
    args: {
      startDate: v.number(),
      endDate: v.number(),
      projectId: v.optional(v.string()),
    },
    returns: v.number(),
    handler: async (ctx, args) => {
      const user = await getCurrentUser(ctx);
      if (!user) return 0;
  
      let query = ctx.db
        .query("transactions")
        .withIndex("by_organization_date", (q) =>
          q
            .eq("organizationId", user.organizationId)
            .gte("date", args.startDate)
            .lte("date", args.endDate)
        )
        .filter((q) =>
          q.and(
            q.eq(q.field("status"), "expected"),
            q.neq(q.field("projectId"), "")
          )
        );
  
      if (args.projectId) {
        query = query.filter((q) => q.eq(q.field("projectId"), args.projectId));
      }
  
      const transactions = await query.collect();
  
      const total = transactions.reduce((sum, t) => sum + t.amount, 0);
      return Math.abs(total);
    },
  });
  
 
export const getAvailableBudget = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    projectId: v.optional(v.string()),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return 0;

    let query = ctx.db
      .query("transactions")
      .withIndex("by_organization_date", (q) =>
        q
          .eq("organizationId", user.organizationId)
          .gte("date", args.startDate)
          .lte("date", args.endDate)
      )
      .filter((q) => q.neq(q.field("projectId"), ""));

    if (args.projectId) {
      query = query.filter((q) => q.eq(q.field("projectId"), args.projectId));
    }

    const transactions = await query.collect();

    let plannedIncomeAmount = 0;
    let receivedAmount = 0;
    let spentAmount = 0;

    for (const transaction of transactions) {
      const isPlannedIncome =
        transaction.status === "expected" &&
        transaction.amount > 0 &&
        !transaction.matchedTransactionId;

      const isReceivedIncome =
        transaction.status === "processed" && transaction.amount > 0;

      const isSpentExpense =
        transaction.status === "processed" && transaction.amount < 0;

      if (isPlannedIncome) {
        plannedIncomeAmount += transaction.amount;
      } else if (isReceivedIncome) {
        receivedAmount += transaction.amount;
      } else if (isSpentExpense) {
        spentAmount += Math.abs(transaction.amount);
      }
    }

    return plannedIncomeAmount + receivedAmount - spentAmount;
  },
});


export const getReceivedBudget = query({
    args: {
      startDate: v.number(),
      endDate: v.number(),
      projectId: v.optional(v.string()),
    },
    returns: v.number(),
    handler: async (ctx, args) => {
      const user = await getCurrentUser(ctx);
      if (!user) return 0;
  
      let query = ctx.db
        .query("transactions")
        .withIndex("by_organization_date", (q) =>
          q
            .eq("organizationId", user.organizationId)
            .gte("date", args.startDate)
            .lte("date", args.endDate)
        )
        .filter((q) =>
          q.and(
            q.eq(q.field("status"), "processed"),
            q.neq(q.field("projectId"), ""),
            q.gt(q.field("amount"), 0)
          )
        );
  
      if (args.projectId) {
        query = query.filter((q) => q.eq(q.field("projectId"), args.projectId));
      }
  
      const transactions = await query.collect();
  
      const total = transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );
      return total;
    },
  });
  
  export const getSpentBudget = query({
    args: {
      startDate: v.number(),
      endDate: v.number(),
      projectId: v.optional(v.string()),
    },
    returns: v.number(),
    handler: async (ctx, args) => {
      const user = await getCurrentUser(ctx);
      if (!user) return 0;
  
      let query = ctx.db
        .query("transactions")
        .withIndex("by_organization_date", (q) =>
          q
            .eq("organizationId", user.organizationId)
            .gte("date", args.startDate)
            .lte("date", args.endDate)
        )
        .filter((q) =>
          q.and(
            q.eq(q.field("status"), "processed"),
            q.neq(q.field("projectId"), "")
          )
        );
  
      if (args.projectId) {
        query = query.filter((q) => q.eq(q.field("projectId"), args.projectId));
      }
  
      const transactions = await query.collect();
  
      const total = transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );
      return Math.abs(total);
    },
  });
  
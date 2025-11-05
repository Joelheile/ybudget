import { v } from "convex/values";
import { query } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

export const getAllDonors = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return ctx.db
      .query("donors")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .collect();
  },
});

export const getEligibleDonorsForCategory = query({
  args: {
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const allDonors = await ctx.db
      .query("donors")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .collect();

    if (!args.categoryId) {
      return allDonors;
    }

    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      return allDonors;
    }

    return allDonors.filter((donor) =>
      donor.allowedTaxSpheres.includes(category.taxsphere),
    );
  },
});

export const getDonorSummary = query({
  args: { donorId: v.id("donors") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const donor = await ctx.db.get(args.donorId);
    if (!donor || donor.organizationId !== user.organizationId) {
      throw new Error("Donor not found");
    }

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization_donor", (q) =>
        q.eq("organizationId", user.organizationId).eq("donorId", args.donorId),
      )
      .collect();

    let committedIncome = 0;
    let paidIncome = 0;
    let totalExpenses = 0;

    transactions.forEach((transaction) => {
      if (transaction.amount > 0) {
        if (transaction.status === "expected")
          committedIncome += transaction.amount;
        if (transaction.status === "processed")
          paidIncome += transaction.amount;
      } else {
        totalExpenses += Math.abs(transaction.amount);
      }
    });

    return {
      donor: { _id: donor._id, name: donor.name, type: donor.type },
      committedIncome,
      paidIncome,
      openIncome: committedIncome - paidIncome,
      totalExpenses,
    };
  },
});

export const getDonorTransactions = query({
  args: { donorId: v.id("donors") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    return ctx.db
      .query("transactions")
      .withIndex("by_organization_donor", (q) =>
        q.eq("organizationId", user.organizationId).eq("donorId", args.donorId),
      )
      .collect();
  },
});

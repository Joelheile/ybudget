import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

export const createDonationExpenseLink = mutation({
  args: {
    expenseId: v.id("transactions"),
    donationId: v.id("transactions"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    return await ctx.db.insert("donationExpenseLinks", {
      expenseId: args.expenseId,
      donationId: args.donationId,
      organizationId: user.organizationId,
      createdBy: user._id,
    });
  },
});

export const createDonor = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("donation"), v.literal("sponsoring")),
  },

  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    return await ctx.db.insert("donors", {
      name: args.name,
      type: args.type,
      organizationId: user.organizationId,
      createdBy: user._id,
    });
  },
});

import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getCurrentUser } from "../queries/users/getCurrentUser";

export const createDonationExpenseLink = mutation({
  args: {
    expenseId: v.id("transactions"),
    donationId: v.id("transactions"),
  },
  returns: v.id("donationExpenseLinks"),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("User not found");

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
  returns: v.id("donors"),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthenticated");
    }

    return await ctx.db.insert("donors", {
      name: args.name,
      type: args.type,
      organizationId: user.organizationId,
      createdBy: user._id,
    });
  },
});

import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const deleteDonationExpenseLink = mutation({
  args: {
    linkId: v.id("donationExpenseLinks"),
  },
  handler: async (ctx, args) => {
    const link = await ctx.db.get(args.linkId);
    if (!link) throw new Error("Link not found");

    return await ctx.db.delete(args.linkId);
  },
});

import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getCurrentUser } from "./getCurrentUser";

export const addUserToOrganization = mutation({
  args: {
    userId: v.id("users"),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {

    await ctx.db.patch(args.userId, {
      organizationId: args.organizationId,
    });
    return null;
  },
});
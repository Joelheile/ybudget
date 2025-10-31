import { Doc, getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { mutation, MutationCtx, query, QueryCtx } from "../_generated/server";


export const addUserToOrganization = mutation({
  args: {
    userId: v.id("users"),
    organizationId: v.id("organizations"),
  },

  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { organizationId: args.organizationId });
    return args.organizationId;
  },
});



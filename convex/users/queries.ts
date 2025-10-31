import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx, query, QueryCtx } from "../_generated/server";


  export const getUserOrganizationId = query({
    args: {},
    returns: v.boolean(),
    handler: async (ctx) => {
      const userId = await getAuthUserId(ctx);
      if (!userId) return false;
  
      const user = await ctx.db.get(userId);
      if (!user) return false;
      
      return !user.organizationId;
    },
  });
  
  
  
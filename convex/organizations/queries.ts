import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "../_generated/server";

export const getOrganizationName = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return console.error("User not found");

    const user = await ctx.db.get(userId);

    if (!user?.organizationId) return console.error("Organization not found");

    const organization = await ctx.db.get(user.organizationId);
    return organization?.name;
  },
});


export const getOrganizationByDomain = query({
  args: { domain: v.string() },
  handler: async (ctx, args) => {
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_domain", (q) => q.eq("domain", args.domain))
      .first();

    return organization;
  },
});

import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const addOrganization = mutation({
  args: {
    name: v.string(),
    domain: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }
    
    const organizationId = await ctx.db.insert("organizations", {
      name: args.name,
      domain: args.domain,
      createdBy: identity.subject,
    });

    // Update user with organizationId
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    
    if (user) {
      await ctx.db.patch(user._id, { organizationId });
    }
  },
});

// TODO: add organizationid to user when oragnization gets created, also when another user logs in it needs to show that person is part of org

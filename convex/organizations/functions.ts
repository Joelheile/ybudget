import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { mutation } from "../_generated/server";

export const createOrganization = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return console.error("User not found");
    
    const user = await ctx.db.get(userId);
    if (!user) return console.error("User not found");

    const email = user.email as string | undefined;
    const domain = email ? email.split("@")[1] : "";

    const organizationId = await ctx.db.insert("organizations", {
      name: args.name,
      domain,
      createdBy: userId,
    });

    await ctx.runMutation(api.users.functions.addUserToOrganization, {
      userId: user._id,
      organizationId,
    });
    return organizationId;
  },
});

export const addUserToOrganization = mutation({
  args: {},
  returns: v.union(v.id("organizations"), v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not found");

    const user = await ctx.db.get(userId);

    if (!user?.email) throw new Error("User Mail not found");
    const domain = user.email.split("@")[1];
    const org = await ctx.db
      .query("organizations")
      .withIndex("by_domain", (q) => q.eq("domain", domain))
      .first();

    if (org?._id) {
      await assignUserToOrganization(ctx, user._id, org._id);
    }
    return org?._id ?? null;
  },
});

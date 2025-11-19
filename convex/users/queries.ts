import { Id } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { getCurrentUser } from "./getCurrentUser";
import { requireRole } from "./permissions";

export const getUserOrganizationId = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return user.organizationId as Id<"organizations">;
  },
});

export const getUser = query({
  args: {},
  handler: async (ctx) => {
    return getCurrentUser(ctx);
  },
});

export const listOrganizationUsers = query({
  args: {},

  handler: async (ctx) => {
    await requireRole(ctx, "admin");
    const user = await getCurrentUser(ctx);
    return await ctx.db
      .query("users")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .collect();
  },
});

import { query } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

export const getActivePayment = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user.organizationId) return null;

    return await ctx.db
      .query("payments")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .filter((q) => q.eq(q.field("status"), "completed"))
      .first();
  },
});


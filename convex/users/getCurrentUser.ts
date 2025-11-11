import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { polar } from "../polar";

const PRODUCT_ID_TO_KEY: Record<string, string> = {
  "e8eb1cbd-3293-4398-8d48-4ceba2a9456c": "premiumMonthly",
  "4965e6c6-e62a-4e81-98e3-44618f48ae1b": "premiumYearly",
};

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Unauthorized user");
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("User not found");
  
  const subscription = await polar.getCurrentSubscription(ctx, {userId: user._id})

  
  return {
    ...user,
    subscription,
    isPremium: subscription?.productKey === "premiumMonthly" || subscription?.productKey === "premiumYearly",
    organizationId: user.organizationId as Id<"organizations">,
    role: user.role as "admin" | "editor" | "viewer" | undefined,
  };
}

"use node";

import { v } from "convex/values";
import Stripe from "stripe";
import { internal } from "../_generated/api";
import { action, internalQuery } from "../_generated/server";

const stripe = new Stripe(process.env.STRIPE_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export const getSubscriptionIdByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .unique();
    if (!user?.organizationId) return null;

    const organizationId = user.organizationId;
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
      .first();

    return payment?.stripeSubscriptionId ?? null;
  },
});

export const cancelTestSubscription = action({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    if (!process.env.IS_TEST) return;

    const subscriptionId = await ctx.runQuery(
      internal.testing.stripe.getSubscriptionIdByEmail,
      { email },
    );
    if (!subscriptionId) return;

    try {
      await stripe.subscriptions.cancel(subscriptionId);
    } catch {
      // Subscription may already be canceled
    }
  },
});

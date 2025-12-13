import { v } from "convex/values";
import Stripe from "stripe";
import { internal } from "../_generated/api";
import { action } from "../_generated/server";

function getStripe() {
  if (!process.env.STRIPE_KEY) return null;
  return new Stripe(process.env.STRIPE_KEY, {
    apiVersion: "2025-10-29.clover",
  });
}

export const cancelTestSubscription = action({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    if (!process.env.IS_TEST) return;

    const stripe = getStripe();
    if (!stripe) return;

    const subscriptionId = await ctx.runQuery(
      internal.testing.functions.getSubscriptionIdByEmail,
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

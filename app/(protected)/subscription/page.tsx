"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Check, X } from "lucide-react";

export default function SubscriptionPage() {
  const subscription = useQuery(
    api.subscriptions.queries.getSubscriptionStatus,
  );
  const payments = useQuery(api.subscriptions.queries.getOrganizationPayments);

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Subscription</h1>
        <p className="text-muted-foreground">
          Manage your YBudget subscription and billing
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Current Status</h2>

        {subscription ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge
                variant={
                  subscription.status === "active"
                    ? "default"
                    : subscription.status === "trial"
                      ? "secondary"
                      : "destructive"
                }
              >
                {subscription.status.toUpperCase()}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Access</span>
              <div className="flex items-center gap-2">
                {subscription.hasAccess ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">Active</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600">No Access</span>
                  </>
                )}
              </div>
            </div>

            {subscription.tier && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Plan</span>
                <span className="text-sm capitalize">{subscription.tier}</span>
              </div>
            )}

            {subscription.status === "trial" &&
              subscription.daysLeftInTrial !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Trial Ends In</span>
                  <span className="text-sm">
                    {subscription.daysLeftInTrial}{" "}
                    {subscription.daysLeftInTrial === 1 ? "day" : "days"}
                  </span>
                </div>
              )}

            {subscription.trialEndsAt && subscription.status === "trial" && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Trial End Date</span>
                <span className="text-sm">
                  {new Date(subscription.trialEndsAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Loading...</div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Payment History</h2>

        {payments && payments.length > 0 ? (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment._id}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div className="space-y-1">
                  <div className="text-sm font-medium capitalize">
                    {payment.tier} Subscription
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {payment.paidAt
                      ? `Paid on ${new Date(payment.paidAt).toLocaleDateString()}`
                      : `Created on ${new Date(payment._creationTime).toLocaleDateString()}`}
                  </div>
                </div>
                <Badge
                  variant={
                    payment.status === "completed"
                      ? "default"
                      : payment.status === "pending"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {payment.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : payments && payments.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No payment history yet
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Loading...</div>
        )}
      </Card>
    </div>
  );
}

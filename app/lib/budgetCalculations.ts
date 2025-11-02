import type { Doc } from "../../convex/_generated/dataModel";

export function calculateAllocatedBudget(
  transactions: Doc<"transactions">[] | undefined,
): number {
  if (!transactions) return 0;
  return Math.abs(
    transactions
      .filter((t) => t.status === "expected")
      .reduce((sum, t) => sum + t.amount, 0),
  );
}

export function calculateAvailableBudget(
  transactions: Doc<"transactions">[] | undefined,
): number {
  if (!transactions) return 0;
  let plannedIncomeAmount = 0;
  let receivedAmount = 0;
  let spentAmount = 0;

  for (const transaction of transactions) {
    const isPlannedIncome =
      transaction.status === "expected" &&
      transaction.amount > 0 &&
      !transaction.matchedTransactionId;

    const isReceivedIncome =
      transaction.status === "processed" && transaction.amount > 0;

    const isSpentExpense =
      transaction.status === "processed" && transaction.amount < 0;

    if (isPlannedIncome) {
      plannedIncomeAmount += transaction.amount;
    } else if (isReceivedIncome) {
      receivedAmount += transaction.amount;
    } else if (isSpentExpense) {
      spentAmount += Math.abs(transaction.amount);
    }
  }

  return plannedIncomeAmount + receivedAmount - spentAmount;
}

export function calculateSpentBudget(
  transactions: Doc<"transactions">[] | undefined,
): number {
  if (!transactions) return 0;
  return Math.abs(
    transactions
      .filter((t) => t.status === "processed")
      .reduce((sum, t) => sum + t.amount, 0),
  );
}

export function calculateReceivedBudget(
  transactions: Doc<"transactions">[] | undefined,
): number {
  if (!transactions) return 0;
  return transactions
    .filter((t) => t.status === "processed" && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
}

"use client";

import { ImportCSVCard } from "@/components/ImportTransaction/ImportCSVCard";
import { PlannedTransactionMatches } from "@/components/ImportTransaction/PlannedTransactionMatches";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Progress } from "@/components/ui/progress";
import { SidebarInset } from "@/components/ui/sidebar";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

export default function ImportTransactionsPage() {
  const unassignedTransactions = useQuery(
    api.queries.transactionQueries.getUnassignedProcessedTransactions
  );
  const expectedTransactions = useQuery(
    api.queries.transactionQueries.getExpectedTransactions
  );
  const [currentIndex] = useState(0);

  if (
    unassignedTransactions === undefined ||
    expectedTransactions === undefined
  ) {
    return (
      <SidebarInset>
        <PageHeader title="Transaktionen zuordnen" />
        <div className="flex items-center justify-center p-8">
          <div className="text-sm text-muted-foreground">
            Transaktionen werden geladen...
          </div>
        </div>
      </SidebarInset>
    );
  }

  if (unassignedTransactions.length === 0) {
    return (
      <SidebarInset>
        <PageHeader title="Transaktionen zuordnen" />
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">
              Keine unzugeordneten Transaktionen
            </h3>
            <p className="text-sm text-muted-foreground">
              Alle importierten Transaktionen sind bereits Projekten zugeordnet.
            </p>
          </div>
        </div>
      </SidebarInset>
    );
  }

  const currentTransaction = unassignedTransactions[currentIndex];

  return (
    <SidebarInset>
      <div className="flex flex-col h-full">
        <PageHeader title="Transaktionen zuordnen" />
        <div className="flex-1 flex justify-center items-center px-4 lg:px-6 pb-20">
          <ImportCSVCard
            title={
              currentTransaction.counterparty || currentTransaction.description
            }
            description={currentTransaction.description}
            amount={currentTransaction.amount}
            date={new Date(currentTransaction.date)}
            currentIndex={currentIndex + 1}
            totalCount={unassignedTransactions.length}
          />
          <div className="pl-8 -mt-16">
            <PlannedTransactionMatches
              expectedTransactions={expectedTransactions}
              onSelect={() => {}}
            />
          </div>
        </div>
        <div className="absolute bottom-0 w-full px-4 lg:px-6 pb-6">
          <Progress
            className="w-3/4 mx-auto"
            value={(currentIndex / unassignedTransactions.length) * 100}
          />
        </div>
      </div>
    </SidebarInset>
  );
}

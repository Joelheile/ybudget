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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPlannedTransaction, setSelectedPlannedTransaction] = useState<
    string | null
  >(null);

  console.log("Unassigned processed transactions:", unassignedTransactions);
  console.log("Expected transactions:", expectedTransactions);

  const handlePlannedTransactionSelect = (transactionId: string) => {
    setSelectedPlannedTransaction(transactionId);
    console.log("Selected planned transaction:", transactionId);
  };

  if (
    unassignedTransactions === undefined ||
    expectedTransactions === undefined
  ) {
    return (
      <SidebarInset>
        <PageHeader title="Transaktionen zuordnen" />
        <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 md:p-5 pt-0">
          <div className="flex items-center justify-center p-8">
            <div className="text-sm text-muted-foreground">
              Transaktionen werden geladen...
            </div>
          </div>
        </div>
      </SidebarInset>
    );
  }

  if (unassignedTransactions.length === 0) {
    return (
      <SidebarInset>
        <PageHeader title="Transaktionen zuordnen" />
        <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 md:p-5 pt-0">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">
                Keine unzugeordneten Transaktionen
              </h3>
              <p className="text-sm text-muted-foreground">
                Alle importierten Transaktionen sind bereits Projekten
                zugeordnet.
              </p>
            </div>
          </div>
        </div>
      </SidebarInset>
    );
  }

  const currentTransaction = unassignedTransactions[currentIndex];
  const totalTransactions = unassignedTransactions.length;

  return (
    <SidebarInset>
      <div className="flex flex-col h-full">
        <div className="px-4 lg:px-6">
          <PageHeader title="Transaktionen zuordnen" />
        </div>

        <div className="flex  justify-center  pt-30 px-4 lg:px-6 pb-16">
          <ImportCSVCard
            title={
              currentTransaction.counterparty || currentTransaction.description
            }
            description={currentTransaction.description}
            amount={currentTransaction.amount}
            date={new Date(currentTransaction.date)}
            currentIndex={currentIndex + 1}
            totalCount={totalTransactions}
          />

          <div className="pl-8  -mt-16">
            <PlannedTransactionMatches
              currentAmount={currentTransaction.amount}
              currentDate={new Date(currentTransaction.date)}
              currentDescription={currentTransaction.description}
              expectedTransactions={expectedTransactions}
              onSelect={handlePlannedTransactionSelect}
            />
          </div>
        </div>
        <div className=" absolute bottom-0 w-full px-4 lg:px-6 pb-6">
          <Progress
            className="w-3/4 mx-auto"
            value={(currentIndex / totalTransactions) * 100}
          />
        </div>
      </div>
    </SidebarInset>
  );
}

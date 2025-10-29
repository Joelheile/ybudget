"use client";

import { ImportCSVCard } from "@/components/ImportTransaction/ImportCSVCard";
import { PlannedTransactionMatches } from "@/components/ImportTransaction/PlannedTransactionMatches";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Progress } from "@/components/ui/progress";
import { SidebarInset } from "@/components/ui/sidebar";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../../convex/_generated/api";

export default function ImportTransactionsPage() {
  const [index, setIndex] = useState(0);
  const [projectId, setProjectId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const transactions = useQuery(
    api.queries.transactionQueries.getUnassignedProcessedTransactions
  );
  const expectedTransactions = useQuery(
    api.queries.transactionQueries.getExpectedTransactions
  );
  const updateTransaction = useMutation(
    api.functions.transactionMutations.updateProcessedTransaction
  );

  const stateRef = useRef({ index, projectId, categoryId, transactions });
  useEffect(() => {
    stateRef.current = { index, projectId, categoryId, transactions };
  }, [index, projectId, categoryId, transactions]);

  const clearForm = () => {
    setProjectId("");
    setCategoryId("");
  };

  const goToNext = () => {
    const { transactions, index } = stateRef.current;
    if (!transactions || index >= transactions.length - 1) return;
    setIndex(index + 1);
    clearForm();
  };

  const goToPrevious = () => {
    const { index } = stateRef.current;
    if (index === 0) return;
    setIndex(index - 1);
    clearForm();
  };

  const saveCurrent = async () => {
    const { transactions, index, projectId, categoryId } = stateRef.current;
    if (!transactions || !transactions[index]) return;

    try {
      await updateTransaction({
        transactionId: transactions[index]._id,
        projectId: projectId || undefined,
        categoryId: categoryId || undefined,
      });

      toast.success("Transaktion gespeichert");

      const { index: currentIndex, transactions: currentTransactions } =
        stateRef.current;
      if (
        currentTransactions &&
        currentIndex < currentTransactions.length - 1
      ) {
        setIndex(currentIndex + 1);
        clearForm();
      }
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      goToNext();
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      saveCurrent();
    }
    if (e.key === "ArrowLeft" && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      goToPrevious();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [updateTransaction]);

  if (!transactions || !expectedTransactions) {
    return (
      <SidebarInset>
        <div className="px-4 lg:px-6 pb-6 flex flex-col h-full"></div>
        <PageHeader title="Transaktionen zuordnen" />
        <div className="flex items-center justify-center p-8">
          <div className="text-sm text-muted-foreground">Laden...</div>
        </div>
      </SidebarInset>
    );
  }

  if (transactions.length === 0) {
    return (
      <SidebarInset>
        <div className="px-4 lg:px-6 pb-6 flex flex-col h-full">
          <PageHeader title="Transaktionen zuordnen" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">
                Keine unzugeordneten Transaktionen
              </h3>
              <p className="text-sm text-muted-foreground">
                Alle Transaktionen sind bereits zugeordnet.
              </p>
            </div>
          </div>
        </div>
      </SidebarInset>
    );
  }

  const current = transactions[index];

  return (
    <SidebarInset>
      <div className="px-4 lg:px-6 pb-6 flex flex-col h-full">
        <PageHeader title="Transaktionen zuordnen" />
        <div className="flex-1 flex justify-center items-center gap-8 pb-20">
          <PlannedTransactionMatches
            expectedTransactions={expectedTransactions}
          />
          <ImportCSVCard
            title={current.counterparty || ""}
            description={current.description}
            amount={current.amount}
            date={new Date(current.date)}
            currentIndex={index + 1}
            totalCount={transactions.length}
            projectId={projectId}
            categoryId={categoryId}
            onProjectChange={setProjectId}
            onCategoryChange={setCategoryId}
          />
        </div>
        <div className="mt-auto pt-6">
          <Progress
            className="w-3/4 mx-auto"
            value={(index / transactions.length) * 100}
          />
        </div>
      </div>
    </SidebarInset>
  );
}

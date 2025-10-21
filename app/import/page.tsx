"use client";

import { DashboardDropdown } from "@/components/Dashboard/DashboardDropdown";
import { ImportCSVCard } from "@/components/ImportTransaction/ImportCSVCard";

import { ImportCSVSheet } from "@/components/Sheets/ImportCSVSheet";
import { TransactionSheet } from "@/components/Sheets/TransactionSheet";
import { mockTransactions } from "@/components/data/mockTransactions";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useDateRange } from "@/contexts/DateRangeContext";
import { useState } from "react";

export default function ImportTransactionsPage() {
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isIncomeOpen, setIsIncomeOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { selectedDateRange } = useDateRange();

  const filteredTransactions = mockTransactions.filter((transaction) => {
    const transactionDate = transaction.date;
    const startDate = selectedDateRange.from;
    const endDate = selectedDateRange.to;

    if (!startDate) return true;

    if (startDate && endDate) {
      return transactionDate >= startDate && transactionDate <= endDate;
    }

    return transactionDate >= startDate;
  });

  const [viewed, setViewed] = useState(0);
  const importedTransactions = [];
  const total = importedTransactions.length;

  return (
    <SidebarInset>
      <header className="flex w-full h-16 overflow-visible">
        <div className="flex w-full items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <div className="flex w-full justify-between">
            <h1 className="text-xl font-semibold flex items-center">
              Transaktionen zuordnen
            </h1>
            <DashboardDropdown
              onOpenExpense={() => setIsExpenseOpen(true)}
              onOpenIncome={() => setIsIncomeOpen(true)}
              onOpenImport={() => setIsImportOpen(true)}
            />
          </div>
        </div>
      </header>
      <div className="flex pt-10 flex-1 flex-col gap-4 p-5 ">
        <ImportCSVCard
          amount={32.2}
          title={"AWS Invoice"}
          date={new Date()}
          currentIndex={viewed}
          totalCount={total}
        />
        <Progress
          className="absolute bottom-4 w-3/4 self-center"
          value={(viewed / total) * 10}
        />
      </div>

      <TransactionSheet
        type="expense"
        open={isExpenseOpen}
        onOpenChange={setIsExpenseOpen}
      />
      <TransactionSheet
        type="income"
        open={isIncomeOpen}
        onOpenChange={setIsIncomeOpen}
      />
      <ImportCSVSheet open={isImportOpen} onOpenChange={setIsImportOpen} />
    </SidebarInset>
  );
}

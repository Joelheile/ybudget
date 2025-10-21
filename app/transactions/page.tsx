"use client";

import { DashboardDropdown } from "@/components/DashboardDropdown";
import { RangeCalendarToggle } from "@/components/RangeCalendarToggle";
import { DataTable } from "@/components/TransactionsTable/DataTable";
import { columns } from "@/components/TransactionsTable/columns";
import { mockTransactions } from "@/components/data/mockTransactions";
import { TransactionSheet } from "@/components/sheets/TransactionSheet";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useDateRange } from "@/contexts/DateRangeContext";
import { useState } from "react";

export default function Transactions() {
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isIncomeOpen, setIsIncomeOpen] = useState(false);
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
            <RangeCalendarToggle />
            <DashboardDropdown
              onOpenExpense={() => setIsExpenseOpen(true)}
              onOpenIncome={() => setIsIncomeOpen(true)}
              onOpenImport={() => {}}
            />
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-5 pt-0">
        <DataTable columns={columns} data={filteredTransactions} />
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
    </SidebarInset>
  );
}

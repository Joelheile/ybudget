"use client";

import { DashboardDropdown } from "@/components/Dashboard/DashboardDropdown";
import { RangeCalendarToggle } from "@/components/RangeCalendar/RangeCalendarToggle";
import { ImportCSVSheet } from "@/components/Sheets/ImportCSVSheet";
import { TransactionSheet } from "@/components/Sheets/TransactionSheet";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";

export function PageHeader({ title }: { title?: string }) {
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isIncomeOpen, setIsIncomeOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  return (
    <>
      <header className="flex w-full h-16 items-center overflow-visible">
        <div className="flex w-full items-center gap-2 ">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <div className="flex w-full items-center justify-between">
            <h1 className="text-xl font-semibold flex items-center">{title}</h1>
            <div className="flex flex-row gap-4">
              <RangeCalendarToggle />

              <DashboardDropdown
                onOpenExpense={() => setIsExpenseOpen(true)}
                onOpenIncome={() => setIsIncomeOpen(true)}
                onOpenImport={() => setIsImportOpen(true)}
              />
            </div>
          </div>
        </div>
      </header>

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
    </>
  );
}

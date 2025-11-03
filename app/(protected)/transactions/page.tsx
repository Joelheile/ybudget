"use client";

import { PageHeader } from "@/components/Layout/PageHeader";
import { EditableDataTable } from "@/components/Tables/EditableDataTable";
import { columns } from "@/components/Tables/columns";
import { SidebarInset } from "@/components/ui/sidebar";
import { useDateRange } from "@/contexts/DateRangeContext";
import { filterTransactionsByDateRange } from "@/lib/transactionFilters";
import { useMutation, useQuery } from "convex/react";
import { useMemo } from "react";
import { api } from "../../../convex/_generated/api";

export default function Transactions() {
  const { selectedDateRange } = useDateRange();
  const updateTransaction = useMutation(
    api.transactions.functions.updateProcessedTransaction,
  );

  const allTransactions = useQuery(
    api.transactions.queries.getAllTransactions,
  );

  const transactions = useMemo(
    () => filterTransactionsByDateRange(allTransactions, selectedDateRange),
    [allTransactions, selectedDateRange],
  );

  const handleUpdateTransaction = async (
    rowId: string,
    field: string,
    value: any,
  ) => {
    await updateTransaction({
      transactionId: rowId,
      [field]: value,
    });
  };

  if (transactions === undefined) {
    return (
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 md:p-5 pt-0 overflow-x-hidden w-full">
          <PageHeader title="Transaktionen" />
          <div className="flex items-center justify-center p-8">
            <div className="text-sm text-muted-foreground">
              Transaktionen werden geladen...
            </div>
          </div>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 md:p-5 pt-0 overflow-x-hidden w-full">
        <PageHeader title="Transaktionen" />
        <EditableDataTable
          columns={columns}
          data={transactions}
          onUpdate={handleUpdateTransaction}
        />
      </div>
    </SidebarInset>
  );
}

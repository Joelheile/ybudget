"use client";

import BudgetCard from "@/components/Dashboard/BudgetCard";
import { PageHeader } from "@/components/Layout/PageHeader";
import { EditableDataTable } from "@/components/Tables/EditableDataTable";
import { columns } from "@/components/Tables/columns";
import { mockDonors } from "@/components/data/mockDonors";
import { mockTransactions } from "@/components/data/mockTransactions";
import { SidebarInset } from "@/components/ui/sidebar";
import { useParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function DonorDetail() {
  const params = useParams();
  const donorId = params.donorId as string;
  const updateTransaction = useMutation(
    api.functions.transactionMutations.updateTransaction
  );

  const donor = mockDonors.find((d) => d.id === donorId);

  if (!donor) {
    return (
      <SidebarInset>
        <div className="p-6">
          <p>Förderer nicht gefunden</p>
        </div>
      </SidebarInset>
    );
  }

  const donorTransactions = mockTransactions.filter(
    (t) => t.donor === donor.name
  );

  const handleUpdateTransaction = async (
    rowId: string,
    field: string,
    value: any
  ) => {
    await updateTransaction({
      transactionId: rowId,
      [field]: value,
    });
  };

  return (
    <SidebarInset>
      <div className="p-4 lg:px-6 pb-6 overflow-x-hidden w-full">
        <PageHeader title={donor.name} />

        <div className="mb-6">
          <p className="text-sm text-muted-foreground capitalize">
            {donor.type}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <BudgetCard title="Zugesagt" amount={donor.totalAgreed} />
          <BudgetCard title="Bezahlt" amount={donor.totalPaid} />
          <BudgetCard title="Offen" amount={donor.totalOpen} />
        </div>

        <div className="mt-4 lg:mt-6">
          <h2 className="text-xl font-semibold mb-4">Transaktionen</h2>
          <EditableDataTable
            columns={columns}
            data={donorTransactions}
            onUpdate={handleUpdateTransaction}
          />
        </div>
      </div>
    </SidebarInset>
  );
}

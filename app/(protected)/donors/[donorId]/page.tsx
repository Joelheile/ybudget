"use client";

import { PageHeader } from "@/components/Layout/PageHeader";
import { EditableDataTable } from "@/components/Tables/EditableDataTable";
import { columns } from "@/components/Tables/columns";
import { SidebarInset } from "@/components/ui/sidebar";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export default function DonorDetail() {
  const params = useParams();
  const donorId = params.donorId as string;
  const updateTransaction = useMutation(
    api.transactions.functions.updateTransaction
  );

  const donor = useQuery(
    api.donors.queries.getDonorById,
    donorId ? { donorId: donorId as Id<"donors"> } : "skip"
  );

  const donorTransactions = useQuery(
    api.donors.queries.getDonorTransactions,
    donorId ? { donorId: donorId as Id<"donors"> } : "skip"
  );

  const handleUpdateTransaction = async (
    rowId: string,
    field: string,
    value: any
  ) => {
    await updateTransaction({
      transactionId: rowId as Id<"transactions">,
      [field]: value,
    });
  };

  if (donor === undefined || donorTransactions === undefined) {
    return (
      <SidebarInset>
        <div className="p-6">
          <p>Lade Förderer...</p>
        </div>
      </SidebarInset>
    );
  }

  if (!donor) {
    return (
      <SidebarInset>
        <div className="p-6">
          <p>Förderer nicht gefunden</p>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <div className="p-4 lg:px-6 pb-6 overflow-x-hidden w-full">
        <PageHeader title={donor.name} />

        <div className="mb-6">
          <p className="text-sm text-muted-foreground capitalize">
            {donor.type}
          </p>
        </div>

        {/* <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <BudgetCard title="Zugesagt" amount={donor.totalAgreed} />
          <BudgetCard title="Bezahlt" amount={donor.totalPaid} />
          <BudgetCard title="Offen" amount={donor.totalOpen} />
        </div> */}

        <div className="mt-4 lg:mt-6">
          <h2 className="text-xl font-semibold mb-4">Transaktionen</h2>
          <EditableDataTable
            columns={columns}
            data={donorTransactions || []}
            onUpdate={handleUpdateTransaction}
          />
        </div>
      </div>
    </SidebarInset>
  );
}

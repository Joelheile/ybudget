"use client";

import { AccessDenied } from "@/components/Settings/AccessDenied";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useIsAdmin } from "@/lib/hooks/useCurrentUserRole";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { DonorDetailSkeleton } from "./DonorDetailSkeleton";
import { DonorDetailUI } from "./DonorDetailUI";

export default function DonorDetailPage() {
  const { donorId } = useParams<{ donorId: Id<"donors"> }>();
  const isAdmin = useIsAdmin();

  const donor = useQuery(api.donors.queries.getDonorById, { donorId });
  const { results: transactions, status } = usePaginatedQuery(
    api.transactions.queries.getPaginatedTransactions,
    { donorId },
    { initialNumItems: 50 },
  );

  const updateTransaction = useMutation(
    api.transactions.functions.updateTransaction,
  );
  const deleteTransaction = useMutation(
    api.transactions.functions.deleteExpectedTransaction,
  );

  const handleUpdate = async (rowId: string, field: string, value: unknown) => {
    await updateTransaction({
      transactionId: rowId as Id<"transactions">,
      [field]: value,
    });
  };

  const handleDelete = async (rowId: string) => {
    await deleteTransaction({ transactionId: rowId as Id<"transactions"> });
  };

  if (!isAdmin) return <AccessDenied title="Förderer" />;
  if (!donor) return <DonorDetailSkeleton />;

  return (
    <DonorDetailUI
      donor={donor}
      transactions={transactions}
      status={status}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
    />
  );
}

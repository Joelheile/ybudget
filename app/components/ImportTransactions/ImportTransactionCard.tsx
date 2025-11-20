"use client";

import { ImportTransactionCardUI } from "@/components/ImportTransactions/ImportTransactionCardUI";
import { useMemo } from "react";

interface ImportTransactionCardProps {
  title: string;
  description?: string;
  amount: number;
  date: Date;
  currentIndex: number;
  totalCount: number;
  projectId: string;
  categoryId: string;
  donorId: string;
  splitIncome: boolean;
  onProjectChange: (projectId: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onDonorChange: (donorId: string) => void;
  onSplitIncomeChange: (splitIncome: boolean) => void;
}

export const ImportTransactionCard = ({
  title,
  description,
  amount,
  date,
  currentIndex,
  totalCount,
  projectId,
  categoryId,
  donorId,
  splitIncome,
  onProjectChange,
  onCategoryChange,
  onDonorChange,
  onSplitIncomeChange,
}: ImportTransactionCardProps) => {
  const isExpense = useMemo(() => amount < 0, [amount]);
  const isIncome = useMemo(() => amount > 0, [amount]);

  return (
    <ImportTransactionCardUI
      title={title}
      description={description}
      amount={amount}
      date={date}
      currentIndex={currentIndex}
      totalCount={totalCount}
      projectId={projectId}
      categoryId={categoryId}
      donorId={donorId}
      isExpense={isExpense}
      isIncome={isIncome}
      splitIncome={splitIncome}
      onProjectChange={onProjectChange}
      onCategoryChange={onCategoryChange}
      onDonorChange={onDonorChange}
      onSplitIncomeChange={onSplitIncomeChange}
    />
  );
};

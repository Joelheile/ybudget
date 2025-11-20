import { ExpectedTransactionMatchesUI } from "@/components/ImportTransactions/ExpectedTransactionMatchesUI";
import { ImportTransactionCard } from "@/components/ImportTransactions/ImportTransactionCard";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Progress } from "@/components/ui/progress";
import type { Doc } from "@/convex/_generated/dataModel";

interface ImportTransactionsUIProps {
  current: Doc<"transactions"> | null;
  index: number;
  totalCount: number;
  projectId: string;
  categoryId: string;
  donorId: string;
  selectedMatch: string | null;
  splitIncome: boolean;
  expectedTransactions: Doc<"transactions">[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  setProjectId: (value: string) => void;
  setCategoryId: (value: string) => void;
  setDonorId: (value: string) => void;
  handleExpectedTransactionSelect: (id: string) => void;
  onSplitIncomeChange: (splitIncome: boolean) => void;
}

export const ImportTransactionsUI = ({
  current,
  index,
  totalCount,
  projectId,
  categoryId,
  donorId,
  selectedMatch,
  splitIncome,
  expectedTransactions,
  containerRef,
  setProjectId,
  setCategoryId,
  setDonorId,
  handleExpectedTransactionSelect,
  onSplitIncomeChange,
}: ImportTransactionsUIProps) => {
  if (totalCount === 0) {
    return (
      <div id="tour-import-page">
        <PageHeader title="Transaktionen zuordnen" />
        <div className="flex items-center justify-center">
          <p className="text-lg text-muted-foreground">
            Es gibt keine Transaktionen zum Zuordnen
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="tour-import-page">
      <PageHeader title="Transaktionen zuordnen" />
      <div className="flex mt-8 justify-center" id="tour-import-progress">
        <Progress className="w-3/4" value={((index + 1) / totalCount) * 100} />
      </div>
      <div className="flex mt-24 gap-16 h-full">
        <div id="tour-expected-matches">
          <ExpectedTransactionMatchesUI
            expectedTransactions={expectedTransactions}
            selectedMatch={selectedMatch}
            containerRef={containerRef}
            onSelect={handleExpectedTransactionSelect}
          />
        </div>
        <div id="tour-import-card">
          {current && (
            <ImportTransactionCard
              title={current.counterparty || ""}
              description={current.description}
              amount={current.amount}
              date={new Date(current.date)}
              currentIndex={index + 1}
              totalCount={totalCount}
              projectId={projectId}
              categoryId={categoryId}
              donorId={donorId}
              splitIncome={splitIncome}
              onProjectChange={setProjectId}
              onCategoryChange={setCategoryId}
              onDonorChange={setDonorId}
              onSplitIncomeChange={onSplitIncomeChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

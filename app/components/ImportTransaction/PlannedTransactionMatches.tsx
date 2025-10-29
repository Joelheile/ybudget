import { useState } from "react";

interface ExpectedTransaction {
  _id: string;
  description: string;
  amount: number;
  date: number;
  projectName: string;
  categoryName: string;
}

interface PlannedTransactionMatchesProps {
  currentAmount: number;
  currentDate: Date;
  currentDescription?: string;
  expectedTransactions: ExpectedTransaction[];
  onSelect: (transactionId: string) => void;
}

export const PlannedTransactionMatches = ({
  currentAmount,
  currentDate,
  currentDescription,
  expectedTransactions,
  onSelect,
}: PlannedTransactionMatchesProps) => {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  // Show up to 3 expected transactions
  const matches = expectedTransactions.slice(0, 3);

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(Math.abs(value));
  };

  const handleSelect = (transactionId: string) => {
    setSelectedMatch(transactionId);
    onSelect(transactionId);
  };

  return (
    <div className="w-80">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Geplante Ausgaben</h3>
        <p className="text-sm text-muted-foreground">
          Mögliche Übereinstimmungen
        </p>
      </div>
      
      <div className="space-y-3">
        {matches.map((match) => (
          <div
            key={match._id}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedMatch === match._id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => handleSelect(match._id)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <p className="font-medium text-sm">{match.description}</p>
                <p className="text-xs text-muted-foreground">{match.projectName}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium">{formatAmount(match.amount)}</span>
              <span className="text-muted-foreground">
                {new Date(match.date).toLocaleDateString("de-DE")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
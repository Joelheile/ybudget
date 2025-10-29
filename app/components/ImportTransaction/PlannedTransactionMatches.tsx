import { useState } from "react";

interface ExpectedTransaction {
  _id: string;
  description: string;
  amount: number;
  date: number;
  projectName: string;
}

interface PlannedTransactionMatchesProps {
  expectedTransactions: ExpectedTransaction[];
  onSelect: (transactionId: string) => void;
}

export const PlannedTransactionMatches = ({
  expectedTransactions,
  onSelect,
}: PlannedTransactionMatchesProps) => {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  return (
    <div className="w-80">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Mögliche Matches</h3>
        <p className="text-sm text-muted-foreground">
          (anhand geplanter Ausgaben)
        </p>
      </div>

      <div className="space-y-3">
        {expectedTransactions.slice(0, 3).map((match) => (
          <div
            key={match._id}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedMatch === match._id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => {
              setSelectedMatch(match._id);
              onSelect(match._id);
            }}
          >
            <div className="mb-2">
              <p className="font-medium text-sm">{match.description}</p>
              <p className="text-xs text-muted-foreground">
                {match.projectName}
              </p>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium">
                {new Intl.NumberFormat("de-DE", {
                  style: "currency",
                  currency: "EUR",
                }).format(Math.abs(match.amount))}
              </span>
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

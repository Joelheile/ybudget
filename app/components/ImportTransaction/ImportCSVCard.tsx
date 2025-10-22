import { useState } from "react";
import { SelectCategory } from "../Sheets/SelectCategory";
import { SelectPlannedTransaction } from "../Sheets/SelectPlannedTransaction";
import { SelectProject } from "../Sheets/SelectProject";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Label } from "../ui/label";

interface ImportCSVCardProps {
  title: string;
  amount: number;
  date: Date;
  currentIndex: number;
  totalCount: number;
}

export const ImportCSVCard = ({
  title,
  amount,
  date,
  currentIndex,
  totalCount,
}: ImportCSVCardProps) => {
  const [project, setProject] = useState("");
  const [category, setCategory] = useState("");
  const [plannedTransaction, setPlannedTransaction] = useState("");
  const [wallet, setWallet] = useState("");

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  return (
    <Card className="max-w-4xl mx-auto p-8">
      <div className="flex justify-end text-sm text-muted-foreground mb-8">
        {currentIndex} von {totalCount}
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <div className="flex items-center gap-8">
          <span className="text-3xl font-bold">{formatAmount(amount)}</span>
          <span className="text-xl text-muted-foreground">
            {date.toLocaleDateString("de-DE")}
          </span>
        </div>
      </div>

      <CardContent className="space-y-6 p-0">
        <div className="space-y-2">
          <Label>Projekt</Label>
          <SelectProject value={project} onValueChange={setProject} />
        </div>

        <div className="space-y-2">
          <Label>Kategorie</Label>
          <SelectCategory value={category} onValueChange={setCategory} />
        </div>

        <div className="space-y-2">
          <Label>Geplante Ausgabe</Label>
          <SelectPlannedTransaction
            value={plannedTransaction}
            onValueChange={setPlannedTransaction}
          />
        </div>

        <div className="space-y-2">
          <Label>Geldtopf</Label>
          <SelectProject value={wallet} onValueChange={setWallet} />
        </div>
      </CardContent>

      <CardFooter className="flex justify-center gap-2 mt-8 p-0 text-sm text-muted-foreground">
        <span>← Next</span>
        <span>•</span>
        <span>⌘← Skip</span>
        <span>•</span>
        <span>⌘Z Previous</span>
        <span>•</span>
        <span>Esc Overview</span>
      </CardFooter>
    </Card>
  );
};

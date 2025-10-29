import { useState } from "react";
import { SelectCategory } from "../Sheets/SelectCategory";
import { SelectProject } from "../Sheets/SelectProject";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Label } from "../ui/label";

interface ImportCSVCardProps {
  title: string;
  description?: string;
  amount: number;
  date: Date;
  currentIndex: number;
  totalCount: number;
}

export const ImportCSVCard = ({
  title,
  description,
  amount,
  date,
  currentIndex,
  totalCount,
}: ImportCSVCardProps) => {
  const [project, setProject] = useState("");
  const [category, setCategory] = useState("");

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  return (
    <Card className="max-w-6xl  mx-auto p-8">
      <div className="flex justify-end text-sm text-muted-foreground mb-8">
        {currentIndex} von {totalCount}
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        {description && (
          <p className="text-lg text-muted-foreground mb-4">{description}</p>
        )}
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
      </CardContent>

      <CardFooter className="flex justify-center gap-4 mt-8 p-0 text-sm text-muted-foreground">
        <span>→ Weiter</span>
        <span>•</span>
        <span>⌘← Überspringen</span>
        <span>•</span>
        <span>⌘Z Zurück</span>
      </CardFooter>
    </Card>
  );
};

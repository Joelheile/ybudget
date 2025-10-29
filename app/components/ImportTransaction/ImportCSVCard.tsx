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
  projectId: string;
  categoryId: string;
  onProjectChange: (projectId: string) => void;
  onCategoryChange: (categoryId: string) => void;
}

export const ImportCSVCard = ({
  title,
  description,
  amount,
  date,
  currentIndex,
  totalCount,
  projectId,
  categoryId,
  onProjectChange,
  onCategoryChange,
}: ImportCSVCardProps) => {
  const formatAmount = (value: number) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(value);

  return (
    <Card className="w-2/5 h-2/3 mx-auto p-8">
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-2">{title}</h2>
            {description && (
              <p className="text-base text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="ml-6 px-3 py-1.5 rounded-md bg-muted text-sm text-muted-foreground">
            {currentIndex} / {totalCount}
          </div>
        </div>

        <div className="flex items-baseline gap-16 pt-4">
          <div>
            <div className="text-xs text-muted-foreground uppercase mb-1">
              Betrag
            </div>
            <div className="text-base font-semibold tabular-nums">
              {formatAmount(amount)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase mb-1">
              Datum
            </div>
            <div className="text-base">{date.toLocaleDateString("de-DE")}</div>
          </div>
        </div>
      </div>

      <CardContent className="space-y-6 p-0">
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-semibold">Projekt</Label>
          <SelectProject value={projectId} onValueChange={onProjectChange} />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-semibold">Kategorie</Label>
          <SelectCategory value={categoryId} onValueChange={onCategoryChange} />
        </div>
      </CardContent>

      <CardFooter className="flex justify-center gap-3 mt-auto pt-6 text-xs text-muted-foreground">
        <span className="font-medium">⌘↩ Speichern</span>
        <span className="text-muted-foreground/50">•</span>
        <span>→ Überspringen</span>
        <span className="text-muted-foreground/50">•</span>
        <span>← Zurück</span>
      </CardFooter>
    </Card>
  );
};

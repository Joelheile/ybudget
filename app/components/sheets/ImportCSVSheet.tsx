"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMutation } from "convex/react";
import { Upload } from "lucide-react";
import Papa from "papaparse";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../../convex/_generated/api";
import { mapCSVRow } from "../../lib/csvMappers";

type ImportSource = "moss" | "sparkasse" | "volksbank";

export function ImportCSVSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const [importSource, setImportSource] = useState<ImportSource | "">("");
  const [isDragging, setIsDragging] = useState(false);

  const addTransaction = useMutation(
    api.functions.transactionMutations.addImportedTransaction
  );

  const handleFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<Record<string, string>>) => {
        setCsvData(results.data);
      },
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    if (!importSource) return;

    try {
      for (const row of csvData) {
        const mapped = mapCSVRow(row, importSource);
        await addTransaction({
          date: mapped.date,
          amount: mapped.amount,
          description: mapped.description,
          counterparty: mapped.counterparty,
          importedTransactionId: mapped.importedTransactionId,
          importSource: importSource,
          accountName: mapped.accountName,
        });
      }

      toast.success(`${csvData.length} Transaktionen importiert!`);
      setCsvData([]);
      setImportSource("");
      onOpenChange(false);
    } catch (error) {
      toast.error("Fehler beim Importieren");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>CSV-Datei importieren</SheetTitle>
          <SheetDescription>
            Ziehen Sie eine CSV-Datei hierher oder wählen Sie eine Datei aus
          </SheetDescription>
        </SheetHeader>

        {csvData.length === 0 ? (
          <div className="mt-8 px-5">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <Upload
                className={`h-12 w-12 mb-4 ${
                  isDragging ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <p className="text-lg font-medium mb-2">CSV-Datei hier ablegen</p>
              <p className="text-sm text-muted-foreground mb-4">oder</p>
              <Button asChild variant="outline">
                <label className="cursor-pointer">
                  Datei auswählen
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                </label>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 px-5">
            <div className="mb-6">
              <Label className="text-base font-medium">
                Datenquelle auswählen
              </Label>
              <Select
                value={importSource}
                onValueChange={(value) =>
                  setImportSource(value as ImportSource)
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Wählen Sie die Datenquelle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moss">Moss</SelectItem>
                  <SelectItem value="sparkasse">Sparkasse</SelectItem>
                  <SelectItem value="volksbank">Volksbank</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <h3 className="text-lg font-medium mb-4">CSV Vorschau</h3>
            <div className="max-h-64 overflow-auto border rounded-md mb-4">
              <pre className="p-4 text-xs">
                {JSON.stringify(csvData.slice(0, 5), null, 2)}
              </pre>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Zeige erste 5 Zeilen von {csvData.length} Zeilen
            </p>

            <Button
              onClick={handleImport}
              disabled={!importSource}
              className="w-full"
            >
              Transaktionen importieren
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

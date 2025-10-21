"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ImportCSVSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) {
      onOpenChange(false);
      router.push("/import");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onOpenChange(false);
      router.push("/import");
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

        <div className="mt-8 px-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
            className={
              isDragging
                ? "border-2 border-dashed rounded-lg p-12 border-primary bg-primary/5 flex flex-col items-center justify-center cursor-pointer"
                : "border-2 border-dashed rounded-lg p-12 border-muted-foreground/25 hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer"
            }
          >
            <Upload
              className={
                isDragging
                  ? "h-12 w-12 mb-4 text-primary"
                  : "h-12 w-12 mb-4 text-muted-foreground"
              }
            />
            <p className="text-lg font-medium mb-2">CSV-Datei hier ablegen</p>
            <p className="text-sm text-muted-foreground mb-4">oder</p>
            <Button asChild variant="outline">
              <label className="cursor-pointer">
                Datei auswählen
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

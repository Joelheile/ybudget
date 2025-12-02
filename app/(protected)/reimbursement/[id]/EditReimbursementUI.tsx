import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ReceiptUpload } from "../new/ReceiptUpload";

interface EditReimbursementUIProps {
  projects: Doc<"projects">[];
  receipts: Doc<"receipts">[];
  selectedProjectId: Id<"projects"> | null;
  bankDetails: { iban: string; bic: string; accountHolder: string };
  editingBank: boolean;
  showAddReceipt: boolean;
  editingReceiptId: Id<"receipts"> | null;
  editingReceipt: any;
  newReceipt: any;
  changingImageReceiptId: Id<"receipts"> | null;
  changingImageReceipt: any;
  totalNet: number;
  totalTax7: number;
  totalTax19: number;
  totalGross: number;
  onProjectChange: (projectId: Id<"projects">) => void;
  onBankDetailsChange: (details: any) => void;
  onEditBankToggle: () => void;
  onAddReceiptToggle: () => void;
  onEditReceipt: (receipt: Doc<"receipts">) => void;
  onDeleteReceipt: (id: Id<"receipts">) => void;
  onImageClick: (receipt: Doc<"receipts">) => void;
  onSaveReceipt: () => void;
  onAddNewReceipt: () => void;
  onCancelEdit: () => void;
  onSaveImageChange: () => void;
  onCancelImageChange: () => void;
  onSaveAll: () => void;
  setEditingReceipt: (receipt: any) => void;
  setNewReceipt: (receipt: any) => void;
  setChangingImageReceipt: (receipt: any) => void;
}

export function EditReimbursementUI(props: EditReimbursementUIProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const isEditing = props.showAddReceipt || props.editingReceiptId || props.changingImageReceiptId;

  let mode = "list";
  if (props.changingImageReceiptId) mode = "image";
  else if (props.editingReceiptId) mode = "edit";
  else if (props.showAddReceipt) mode = "add";

  const receipt = mode === "image" ? props.changingImageReceipt : mode === "edit" ? props.editingReceipt : props.newReceipt;
  const setReceipt = mode === "image" ? props.setChangingImageReceipt : mode === "edit" ? props.setEditingReceipt : props.setNewReceipt;
  const onSave = mode === "image" ? props.onSaveImageChange : mode === "edit" ? props.onSaveReceipt : props.onAddNewReceipt;
  const onCancel = mode === "image" ? props.onCancelImageChange : props.onCancelEdit;
  const title = mode === "image" ? "Bild ändern" : mode === "edit" ? "Beleg bearbeiten" : "Beleg hinzufügen";
  const saveText = mode === "image" ? "Bild speichern" : mode === "edit" ? "Änderungen speichern" : "Beleg hinzufügen";

  const calculatedNet = receipt?.grossAmount ? (parseFloat(receipt.grossAmount) / (1 + parseFloat(receipt.taxRate) / 100)).toFixed(2) : "0.00";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <div>
        <Label>Projekt *</Label>
        <Select
          value={props.selectedProjectId || ""}
          onValueChange={props.onProjectChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Wählen Sie ein Projekt" />
          </SelectTrigger>
          <SelectContent>
            {props.projects.map((p: Doc<"projects">) => (
              <SelectItem key={p._id} value={p._id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {mode === "list" ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Belege</h2>
            <Button variant="outline" onClick={props.onAddReceiptToggle}>
              <Plus className="size-5 mr-2" />
              Beleg hinzufügen
            </Button>
          </div>
          <div className="space-y-3">
            {props.receipts.map((receipt) => (
              <div
                key={receipt._id}
                className="flex items-center justify-between px-3 bg-gray-50 border rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => props.onEditReceipt(receipt)}
              >
                <div className="flex items-center gap-8 flex-1">
                  <span className="font-semibold">{receipt.companyName}</span>
                  <span className="text-sm text-muted-foreground">
                    {receipt.description || "Keine Beschreibung"}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">
                    {receipt.grossAmount.toFixed(2)} €
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      props.onDeleteReceipt(receipt._id);
                    }}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">{title}</h2>

          {mode === "image" ? (
            <div className="space-y-4">
              <div>
                <Label>Neues Bild hochladen</Label>
                <ReceiptUpload
                  onUploadComplete={(storageId) =>
                    setReceipt({ ...receipt, fileStorageId: storageId })
                  }
                  storageId={receipt.fileStorageId || undefined}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name/Firma *</Label>
                  <Input
                    value={receipt.companyName}
                    onChange={(e) =>
                      setReceipt({ ...receipt, companyName: e.target.value })
                    }
                    placeholder="z.B. Amazon, Deutsche Bahn"
                  />
                </div>
                <div>
                  <Label>Beleg-Nr. *</Label>
                  <Input
                    value={receipt.receiptNumber}
                    onChange={(e) =>
                      setReceipt({ ...receipt, receiptNumber: e.target.value })
                    }
                    placeholder="z.B. INV-2024-001"
                  />
                </div>
              </div>

              <div>
                <Label>Beschreibung</Label>
                <Textarea
                  value={receipt.description}
                  onChange={(e) =>
                    setReceipt({ ...receipt, description: e.target.value })
                  }
                  placeholder="z.B. Büromaterial für Q1"
                  rows={2}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Datum *</Label>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !receipt.receiptDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 size-4" />
                        {receipt.receiptDate
                          ? format(new Date(receipt.receiptDate), "dd.MM.yyyy", { locale: de })
                          : "Datum wählen"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={receipt.receiptDate ? new Date(receipt.receiptDate) : undefined}
                        onSelect={(date) => {
                          setReceipt({
                            ...receipt,
                            receiptDate: date ? format(date, "yyyy-MM-dd") : "",
                          });
                          setCalendarOpen(false);
                        }}
                        locale={de}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Bruttobetrag (€) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={receipt.grossAmount}
                    onChange={(e) =>
                      setReceipt({ ...receipt, grossAmount: e.target.value })
                    }
                    placeholder="119,95"
                  />
                </div>
                <div>
                  <Label>Wie viel MwSt.?</Label>
                  <Select
                    value={receipt.taxRate}
                    onValueChange={(value) =>
                      setReceipt({ ...receipt, taxRate: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="19">19%</SelectItem>
                      <SelectItem value="7">7%</SelectItem>
                      <SelectItem value="0">0%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-muted-foreground">Nettobetrag (€)</Label>
                  <Input
                    type="number"
                    value={calculatedNet}
                    disabled
                    className="bg-muted/50 font-mono"
                  />
                </div>
              </div>

              <div>
                <Label>Beleg hochladen *</Label>
                <ReceiptUpload
                  onUploadComplete={(storageId) =>
                    setReceipt({ ...receipt, fileStorageId: storageId })
                  }
                  storageId={receipt.fileStorageId || undefined}
                />
              </div>
            </>
          )}

          <div className="flex gap-4">
            <Button variant="outline" onClick={onCancel}>
              Abbrechen
            </Button>
            <Button onClick={onSave} className="flex-1">
              {saveText}
            </Button>
          </div>
        </div>
      )}

      {props.receipts.length > 0 && !isEditing && (
        <div className="space-y-8 mt-24">
          <h2 className="text-2xl font-bold">Zusammenfassung</h2>
          <div className="flex items-end gap-4">
            <div
              className="grid gap-4 flex-1"
              style={{ gridTemplateColumns: "1fr 2fr 1fr" }}
            >
              {[
                {
                  label: "Kontoinhaber",
                  key: "accountHolder",
                  placeholder: "",
                },
                {
                  label: "IBAN",
                  key: "iban",
                  placeholder: "DE89 3704 0044 0532 0130 00",
                },
                { label: "BIC", key: "bic", placeholder: "COBADEFFXXX" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <Label className="text-xs text-muted-foreground uppercase">
                    {label}
                  </Label>
                  <Input
                    value={
                      props.bankDetails[key as keyof typeof props.bankDetails]
                    }
                    onChange={(e) =>
                      props.onBankDetailsChange({
                        ...props.bankDetails,
                        [key]: e.target.value,
                      })
                    }
                    disabled={!props.editingBank}
                    placeholder={placeholder}
                    className={key !== "accountHolder" ? "font-mono" : ""}
                  />
                </div>
              ))}
            </div>
            <Button
              variant={props.editingBank ? "default" : "outline"}
              size="sm"
              onClick={props.onEditBankToggle}
            >
              {props.editingBank ? "Speichern" : <Pencil className="size-4" />}
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Netto gesamt</span>
              <span>{props.totalNet.toFixed(2)} €</span>
            </div>
            {props.totalTax7 > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">UST 7% gesamt</span>
                <span>{props.totalTax7.toFixed(2)} €</span>
              </div>
            )}
            {props.totalTax19 > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">UST 19% gesamt</span>
                <span>{props.totalTax19.toFixed(2)} €</span>
              </div>
            )}
            <Separator className="my-4" />
            <div className="flex justify-between text-lg font-semibold pt-2 pb-4">
              <span>Brutto gesamt</span>
              <span>{props.totalGross.toFixed(2)} €</span>
            </div>
            <Button
              onClick={props.onSaveAll}
              className="w-full h-14 font-semibold"
              size="lg"
            >
              Alle Änderungen speichern
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

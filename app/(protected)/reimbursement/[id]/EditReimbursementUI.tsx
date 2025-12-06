import { DateInput } from "@/components/Selectors/DateInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ReceiptUpload } from "../new/ReceiptUpload";

export type ReceiptFormData = {
  receiptDate: string;
  companyName: string;
  description: string;
  grossAmount: string;
  taxRate: string;
  receiptNumber: string;
  fileStorageId: Id<"_storage"> | "";
};

type BankDetails = {
  iban: string;
  bic: string;
  accountHolder: string;
};

type Props = {
  projects: Doc<"projects">[];
  receipts: Doc<"receipts">[];
  selectedProjectId: Id<"projects"> | null;
  bankDetails: BankDetails;
  editingBank: boolean;
  editMode: "list" | "add" | "edit" | "image";
  formData: ReceiptFormData;
  totalNet: number;
  totalTax7: number;
  totalTax19: number;
  totalGross: number;
  onProjectChange: (projectId: Id<"projects">) => void;
  onBankDetailsChange: (details: BankDetails) => void;
  onBankToggle: () => void;
  onAddReceiptToggle: () => void;
  onEditReceipt: (receipt: Doc<"receipts">) => void;
  onDeleteReceipt: (id: Id<"receipts">) => void;
  onSave: () => void;
  onAddNewReceipt: () => void;
  onCancel: () => void;
  onSaveAll: () => void;
  setFormData: (data: ReceiptFormData) => void;
};

const calculateNet = (gross: string, rate: string) =>
  ((parseFloat(gross) || 0) / (1 + parseFloat(rate) / 100)).toFixed(2);

export function EditReimbursementUI({
  projects,
  receipts,
  selectedProjectId,
  bankDetails,
  editingBank,
  editMode,
  formData,
  totalNet,
  totalTax7,
  totalTax19,
  totalGross,
  onProjectChange,
  onBankDetailsChange,
  onBankToggle,
  onAddReceiptToggle,
  onEditReceipt,
  onDeleteReceipt,
  onSave,
  onAddNewReceipt,
  onCancel,
  onSaveAll,
  setFormData,
}: Props) {
  const updateField = (field: keyof ReceiptFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const projectSelector = (
    <div>
      <Label>Projekt *</Label>
      <Select value={selectedProjectId || ""} onValueChange={onProjectChange}>
        <SelectTrigger>
          <SelectValue placeholder="Wählen Sie ein Projekt" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((p) => (
            <SelectItem key={p._id} value={p._id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  if (editMode === "list") {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-10">
        {projectSelector}

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Belege</h2>
            <Button variant="outline" onClick={onAddReceiptToggle}>
              <Plus className="size-5 mr-2" />
              Beleg hinzufügen
            </Button>
          </div>
          <div className="space-y-3">
            {receipts.map((receipt) => (
              <div
                key={receipt._id}
                className="flex items-center justify-between px-3 bg-gray-50 border rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => onEditReceipt(receipt)}
              >
                <div className="flex items-center gap-8 flex-1">
                  <span className="font-semibold">{receipt.companyName}</span>
                  <span className="text-sm text-muted-foreground">
                    {receipt.description || "Keine Beschreibung"}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{receipt.grossAmount.toFixed(2)} €</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteReceipt(receipt._id);
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

        {receipts.length > 0 && (
          <div className="space-y-8 mt-24">
            <h2 className="text-2xl font-bold">Zusammenfassung</h2>
            <div className="flex items-end gap-4">
              <div className="grid gap-4 flex-1" style={{ gridTemplateColumns: "1fr 2fr 1fr" }}>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase">Kontoinhaber</Label>
                  <Input
                    value={bankDetails.accountHolder}
                    onChange={(e) =>
                      onBankDetailsChange({ ...bankDetails, accountHolder: e.target.value })
                    }
                    disabled={!editingBank}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase">IBAN</Label>
                  <Input
                    value={bankDetails.iban}
                    onChange={(e) => onBankDetailsChange({ ...bankDetails, iban: e.target.value })}
                    disabled={!editingBank}
                    placeholder="DE89 3704 0044 0532 0130 00"
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase">BIC</Label>
                  <Input
                    value={bankDetails.bic}
                    onChange={(e) => onBankDetailsChange({ ...bankDetails, bic: e.target.value })}
                    disabled={!editingBank}
                    placeholder="COBADEFFXXX"
                    className="font-mono"
                  />
                </div>
              </div>
              <Button variant={editingBank ? "default" : "outline"} size="sm" onClick={onBankToggle}>
                {editingBank ? "Speichern" : <Pencil className="size-4" />}
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Netto gesamt</span>
                <span>{totalNet.toFixed(2)} €</span>
              </div>
              {totalTax7 > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">UST 7% gesamt</span>
                  <span>{totalTax7.toFixed(2)} €</span>
                </div>
              )}
              {totalTax19 > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">UST 19% gesamt</span>
                  <span>{totalTax19.toFixed(2)} €</span>
                </div>
              )}
              <Separator className="my-4" />
              <div className="flex justify-between text-lg font-semibold pt-2 pb-4">
                <span>Brutto gesamt</span>
                <span>{totalGross.toFixed(2)} €</span>
              </div>
              <Button onClick={onSaveAll} className="w-full h-14 font-semibold" size="lg">
                Alle Änderungen speichern
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (editMode === "image") {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-10">
        {projectSelector}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Bild ändern</h2>
          <div>
            <Label>Neues Bild hochladen</Label>
            <ReceiptUpload
              onUploadComplete={(storageId) => updateField("fileStorageId", storageId)}
              storageId={formData.fileStorageId || undefined}
            />
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={onCancel}>
              Abbrechen
            </Button>
            <Button onClick={onSave} className="flex-1">
              Bild speichern
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isAdding = editMode === "add";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      {projectSelector}

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">
          {isAdding ? "Beleg hinzufügen" : "Beleg bearbeiten"}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Name/Firma *</Label>
            <Input
              value={formData.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
              placeholder="z.B. Amazon, Deutsche Bahn"
            />
          </div>
          <div>
            <Label>Beleg-Nr. *</Label>
            <Input
              value={formData.receiptNumber}
              onChange={(e) => updateField("receiptNumber", e.target.value)}
              placeholder="z.B. INV-2024-001"
            />
          </div>
        </div>

        <div>
          <Label>Beschreibung</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="z.B. Büromaterial für Q1"
            rows={2}
            className="resize-none"
          />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label>Datum *</Label>
            <DateInput
              value={formData.receiptDate}
              onChange={(date) => updateField("receiptDate", date)}
            />
          </div>
          <div>
            <Label>Bruttobetrag (€) *</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.grossAmount}
              onChange={(e) => updateField("grossAmount", e.target.value)}
              placeholder="119,95"
            />
          </div>
          <div>
            <Label>Wie viel MwSt.?</Label>
            <Select value={formData.taxRate} onValueChange={(v) => updateField("taxRate", v)}>
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
              value={calculateNet(formData.grossAmount, formData.taxRate)}
              disabled
              className="bg-muted/50 font-mono"
            />
          </div>
        </div>

        <div>
          <Label>Beleg hochladen *</Label>
          <ReceiptUpload
            onUploadComplete={(storageId) => updateField("fileStorageId", storageId)}
            storageId={formData.fileStorageId || undefined}
          />
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onCancel}>
            Abbrechen
          </Button>
          <Button onClick={isAdding ? onAddNewReceipt : onSave} className="flex-1">
            {isAdding ? "Beleg hinzufügen" : "Änderungen speichern"}
          </Button>
        </div>
      </div>
    </div>
  );
}

import { DateInput } from "@/components/Selectors/DateInput";
import { SelectProject } from "@/components/Selectors/SelectProject";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Bus, Car, Hotel, Pencil, Plane, Train, Utensils } from "lucide-react";
import { ReceiptUpload } from "./ReceiptUpload";

export type TravelDetails = {
  travelStartDate: string;
  travelEndDate: string;
  destination: string;
  travelPurpose: string;
  isInternational: boolean;
  carAmount: number | undefined;
  carKilometers: number | undefined;
  carReceiptId: Id<"_storage"> | undefined;
  trainAmount: number | undefined;
  trainReceiptId: Id<"_storage"> | undefined;
  flightAmount: number | undefined;
  flightReceiptId: Id<"_storage"> | undefined;
  taxiAmount: number | undefined;
  taxiReceiptId: Id<"_storage"> | undefined;
  busAmount: number | undefined;
  busReceiptId: Id<"_storage"> | undefined;
  accommodationAmount: number | undefined;
  accommodationReceiptId: Id<"_storage"> | undefined;
  foodAmount: number | undefined;
  foodReceiptId: Id<"_storage"> | undefined;
};

type Props = {
  selectedProjectId: Id<"projects"> | null;
  setSelectedProjectId: (id: Id<"projects"> | null) => void;
  bankDetails: { iban: string; bic: string; accountHolder: string };
  setBankDetails: (details: {
    iban: string;
    bic: string;
    accountHolder: string;
  }) => void;
  editingBank: boolean;
  setEditingBank: () => void;
  travelDetails: TravelDetails;
  setTravelDetails: (details: TravelDetails) => void;
  handleSubmit: () => void;
  reimbursementType: "expense" | "travel";
  setReimbursementType: (type: "expense" | "travel") => void;
};

const transportModes = [
  { key: "car", label: "PKW", icon: Car },
  { key: "train", label: "Bahn", icon: Train },
  { key: "flight", label: "Flug", icon: Plane },
  { key: "taxi", label: "Taxi", icon: Car },
  { key: "bus", label: "Bus", icon: Bus },
] as const;

const extras = [
  { key: "accommodation", label: "Hotel", icon: Hotel },
  { key: "food", label: "Essen", icon: Utensils },
] as const;

type Category = (typeof transportModes)[number]["key"] | (typeof extras)[number]["key"];

export function TravelReimbursementFormUI({
  selectedProjectId,
  setSelectedProjectId,
  bankDetails,
  setBankDetails,
  editingBank,
  setEditingBank,
  travelDetails,
  setTravelDetails,
  handleSubmit,
  reimbursementType,
  setReimbursementType,
}: Props) {
  const update = (fields: Partial<TravelDetails>) =>
    setTravelDetails({ ...travelDetails, ...fields });

  const getAmount = (cat: Category) =>
    travelDetails[`${cat}Amount` as keyof TravelDetails] as number | undefined;

  const getReceiptId = (cat: Category) =>
    travelDetails[`${cat}ReceiptId` as keyof TravelDetails] as Id<"_storage"> | undefined;

  const isSelected = (cat: Category) => getAmount(cat) !== undefined;

  const toggleCategory = (cat: Category) => {
    if (isSelected(cat)) {
      update({
        [`${cat}Amount`]: undefined,
        [`${cat}ReceiptId`]: undefined,
        ...(cat === "car" ? { carKilometers: undefined } : {}),
      });
    } else {
      update({ [`${cat}Amount`]: 0 });
    }
  };

  const hasBasicInfo =
    travelDetails.destination &&
    travelDetails.travelPurpose &&
    travelDetails.travelStartDate &&
    travelDetails.travelEndDate;

  const totalAmount = [...transportModes, ...extras].reduce(
    (sum, { key }) => sum + (getAmount(key) || 0),
    0,
  );

  const allReceiptsUploaded = [...transportModes, ...extras].every(
    ({ key }) => (getAmount(key) || 0) <= 0 || getReceiptId(key),
  );

  const canSubmit = hasBasicInfo && totalAmount > 0 && allReceiptsUploaded;

  const summaryItems = [...transportModes, ...extras]
    .filter(({ key }) => (getAmount(key) || 0) > 0)
    .map(({ key, label }) => ({
      label: key === "accommodation" ? "Hotel" : key === "food" ? "Verpflegung" : label,
      detail:
        key === "car"
          ? `${travelDetails.carKilometers || 0} km × 0,30€`
          : key === "accommodation"
            ? travelDetails.destination
            : "",
      amount: getAmount(key) || 0,
    }));

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Neue Erstattung</h1>
        <div className="flex items-center gap-3">
          <Tabs
            value={reimbursementType}
            onValueChange={(v) => setReimbursementType(v as "expense" | "travel")}
          >
            <TabsList>
              <TabsTrigger value="expense">Auslagenerstattung</TabsTrigger>
              <TabsTrigger value="travel">Reisekostenerstattung</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="w-[200px]">
            <SelectProject
              value={selectedProjectId || ""}
              onValueChange={(v) => setSelectedProjectId(v ? (v as Id<"projects">) : null)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Reiseangaben</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Reiseziel *</Label>
            <Input
              value={travelDetails.destination}
              onChange={(e) => update({ destination: e.target.value })}
              placeholder="z.B. München, Berlin"
            />
          </div>
          <div>
            <Label>Reisezweck *</Label>
            <Input
              value={travelDetails.travelPurpose}
              onChange={(e) => update({ travelPurpose: e.target.value })}
              placeholder="z.B. Kundentermin, Konferenz"
            />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label>Reisebeginn *</Label>
            <DateInput
              value={travelDetails.travelStartDate}
              onChange={(d) => update({ travelStartDate: d })}
            />
          </div>
          <div>
            <Label>Reiseende *</Label>
            <DateInput
              value={travelDetails.travelEndDate}
              onChange={(d) => update({ travelEndDate: d })}
            />
          </div>
          <div className="col-span-2 flex items-end pb-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="international"
                checked={travelDetails.isInternational}
                onCheckedChange={(c: boolean) => update({ isInternational: c })}
              />
              <Label htmlFor="international" className="font-normal">
                Auslandsreise
              </Label>
            </div>
          </div>
        </div>
      </div>

      {hasBasicInfo && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-3">Kostenarten auswählen</h2>
            <div className="flex flex-wrap gap-2">
              {transportModes.map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  type="button"
                  variant={isSelected(key) ? "default" : "outline"}
                  onClick={() => toggleCategory(key)}
                  className="gap-2"
                >
                  <Icon className="size-4" />
                  {label}
                </Button>
              ))}
              <div className="w-px bg-border mx-2" />
              {extras.map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  type="button"
                  variant={isSelected(key) ? "default" : "outline"}
                  onClick={() => toggleCategory(key)}
                  className="gap-2"
                >
                  <Icon className="size-4" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {isSelected("car") && (
            <CostSection title="PKW (0,30€/km)">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Kilometer *</Label>
                  <Input
                    type="number"
                    min={0}
                    value={travelDetails.carKilometers || ""}
                    onChange={(e) => {
                      const km = Math.max(0, Math.floor(parseFloat(e.target.value) || 0));
                      update({ carKilometers: km, carAmount: Math.round(km * 0.3 * 100) / 100 });
                    }}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">Betrag</Label>
                  <Input
                    value={`${(travelDetails.carAmount || 0).toFixed(2)} €`}
                    disabled
                    className="bg-muted/50 font-mono"
                  />
                </div>
              </div>
              {(travelDetails.carAmount || 0) > 0 && (
                <div className="mt-4">
                  <Label>Beleg *</Label>
                  <ReceiptUpload
                    onUploadComplete={(id) => update({ carReceiptId: id })}
                    storageId={travelDetails.carReceiptId}
                  />
                </div>
              )}
            </CostSection>
          )}

          {transportModes
            .filter(({ key }) => key !== "car" && isSelected(key))
            .map(({ key, label }) => (
              <CostSection key={key} title={label}>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Betrag (€) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={getAmount(key) || ""}
                      onChange={(e) =>
                        update({ [`${key}Amount`]: Math.max(0, parseFloat(e.target.value) || 0) })
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>
                {(getAmount(key) || 0) > 0 && (
                  <div className="mt-4">
                    <Label>Beleg *</Label>
                    <ReceiptUpload
                      onUploadComplete={(id) => update({ [`${key}ReceiptId`]: id })}
                      storageId={getReceiptId(key)}
                    />
                  </div>
                )}
              </CostSection>
            ))}

          {extras
            .filter(({ key }) => isSelected(key))
            .map(({ key }) => (
              <CostSection
                key={key}
                title={key === "accommodation" ? "Übernachtung" : "Verpflegung"}
              >
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Betrag (€) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={getAmount(key) || ""}
                      onChange={(e) =>
                        update({ [`${key}Amount`]: Math.max(0, parseFloat(e.target.value) || 0) })
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>
                {(getAmount(key) || 0) > 0 && (
                  <div className="mt-4">
                    <Label>Beleg *</Label>
                    <ReceiptUpload
                      onUploadComplete={(id) => update({ [`${key}ReceiptId`]: id })}
                      storageId={getReceiptId(key)}
                    />
                  </div>
                )}
              </CostSection>
            ))}
        </div>
      )}

      {canSubmit && (
        <div className="space-y-8 mt-24">
          <h2 className="text-2xl font-bold">Zusammenfassung</h2>
          <div className="flex items-end gap-4">
            <div className="grid gap-4 flex-1" style={{ gridTemplateColumns: "1fr 2fr 1fr" }}>
              <div>
                <Label className="text-xs text-muted-foreground uppercase">Kontoinhaber</Label>
                <Input
                  value={bankDetails.accountHolder}
                  onChange={(e) =>
                    setBankDetails({ ...bankDetails, accountHolder: e.target.value })
                  }
                  disabled={!editingBank}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase">IBAN</Label>
                <Input
                  value={bankDetails.iban}
                  onChange={(e) => setBankDetails({ ...bankDetails, iban: e.target.value })}
                  disabled={!editingBank}
                  placeholder="DE89 3704 0044 0532 0130 00"
                  className="font-mono"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase">BIC</Label>
                <Input
                  value={bankDetails.bic}
                  onChange={(e) => setBankDetails({ ...bankDetails, bic: e.target.value })}
                  disabled={!editingBank}
                  placeholder="COBADEFFXXX"
                  className="font-mono"
                />
              </div>
            </div>
            <Button
              variant={editingBank ? "default" : "outline"}
              size="sm"
              onClick={setEditingBank}
            >
              {editingBank ? "Speichern" : <Pencil className="size-4" />}
            </Button>
          </div>

          <div className="space-y-3">
            {summaryItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 bg-gray-50 border rounded-md"
              >
                <div className="flex items-center gap-8 flex-1">
                  <span className="font-semibold">{item.label}</span>
                  {item.detail && (
                    <span className="text-sm text-muted-foreground">{item.detail}</span>
                  )}
                </div>
                <span className="font-semibold">{item.amount.toFixed(2)} €</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-6">
            <Separator className="my-4" />
            <div className="flex justify-between text-lg font-semibold pt-2">
              <span>Gesamt</span>
              <span>{totalAmount.toFixed(2)} €</span>
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full h-14 font-semibold mt-8" size="lg">
            Zur Genehmigung einreichen
          </Button>
        </div>
      )}
    </div>
  );
}

function CostSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h3 className="font-medium">{title}</h3>
      {children}
    </div>
  );
}

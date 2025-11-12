"use client";

import { Badge } from "@/components/ui/badge";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";
import toast from "react-hot-toast";

type TaxSphere =
  | "non-profit"
  | "asset-management"
  | "purpose-operations"
  | "commercial-operations";

interface CreateDonorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateDonorSheet({
  open,
  onOpenChange,
}: CreateDonorSheetProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"donation" | "sponsoring">("donation");
  const [allowedTaxSpheres, setAllowedTaxSpheres] = useState<Set<TaxSphere>>(
    new Set(["non-profit"]),
  );

  const addDonor = useMutation(api.donors.functions.createDonor);

  const taxSphereLabels: Record<TaxSphere, string> = {
    "non-profit": "Ideeller Bereich",
    "asset-management": "Vermögensverwaltung",
    "purpose-operations": "Zweckbetrieb",
    "commercial-operations": "Wirtschaftlicher Geschäftsbetrieb",
  };

  const toggleTaxSphere = (sphere: TaxSphere) => {
    setAllowedTaxSpheres((prev) => {
      const updated = new Set(prev);
      if (updated.has(sphere)) {
        updated.delete(sphere);
      } else {
        updated.add(sphere);
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name ist erforderlich");
      return;
    }

    if (allowedTaxSpheres.size === 0) {
      toast.error("Mindestens ein Steuerbereich muss ausgewählt werden");
      return;
    }

    try {
      await addDonor({
        name: name.trim(),
        type,
        allowedTaxSpheres: Array.from(allowedTaxSpheres),
      });
      toast.success("Förderer erstellt!");
      setName("");
      setType("donation");
      setAllowedTaxSpheres(new Set(["non-profit"]));
      onOpenChange(false);
    } catch (error) {
      toast.error("Fehler beim Erstellen");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col px-4">
        <SheetHeader>
          <SheetTitle>Neuen Förderer erstellen</SheetTitle>
          <SheetDescription>
            Erstelle einen neuen Förderer für deine Organisation
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col justify-between"
        >
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Stadt München"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Typ</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as "donation" | "sponsoring")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="donation">Spende</SelectItem>
                  <SelectItem value="sponsoring">Sponsoring</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Erlaubte Steuerbereiche
                {allowedTaxSpheres.size > 0 && ` (${allowedTaxSpheres.size})`}
              </Label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(taxSphereLabels) as Array<TaxSphere>).map(
                  (sphere) => (
                    <Badge
                      key={sphere}
                      variant={
                        allowedTaxSpheres.has(sphere) ? "default" : "secondary"
                      }
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => toggleTaxSphere(sphere)}
                    >
                      {taxSphereLabels[sphere]}
                    </Badge>
                  ),
                )}
              </div>
            </div>
          </div>
          <SheetFooter className="pt-6">
            <Button type="submit" className="w-full">
              Förderer erstellen
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { SelectProject } from "./SelectProject";

interface CreateProjectSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectSheet({
  open,
  onOpenChange,
}: CreateProjectSheetProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ name, description, parentId });
    setName("");
    setDescription("");
    setParentId("");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col px-4">
        <SheetHeader>
          <SheetTitle>Neues Projekt erstellen</SheetTitle>
          <SheetDescription>
            Erstelle ein neues Projekt für deine Organisation
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col justify-between"
        >
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Projektname</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. YFN 9.0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beschreibe dein Projekt..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentId">
                Übergeordnetes Projekt (optional)
              </Label>
              <SelectProject value={parentId} onValueChange={setParentId} />
            </div>
          </div>
          <SheetFooter className="pt-6">
            <Button type="submit" className="w-full">
              Projekt erstellen
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

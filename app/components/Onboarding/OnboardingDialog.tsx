import { DialogClose } from "@radix-ui/react-dialog";
import { useMutation } from "convex/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export const OnboardingDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [name, setName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(true);

  const createOrganization = useMutation(
    api.functions.organizations.createOrganization
  );
  const addUserToOrganization = useMutation(
    api.functions.organizations.addUserToOrganization
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (showCreateForm) {
      if (!name.trim()) {
        toast.error("Bitte gib einen Namen ein");
        return;
      }

      try {
        await createOrganization({ name });
        toast.success("Verein erstellt. Nice 🥳");
        onOpenChange(false);
      } catch (error) {
        toast.error("Fehler beim Erstellen des Vereins");
      }
    } else {
      try {
        const orgId = await addUserToOrganization({});
        if (!orgId) {
          toast.error("Keine Organisation für deine Domain gefunden");
          setShowCreateForm(true);
          return;
        }
        toast.success("Beigetreten");
        onOpenChange(false);
      } catch (error) {
        toast.error("Fehler beim Beitreten");
      }
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              Willkommen bei YBudget :)
            </DialogTitle>
            <DialogDescription>
              {showCreateForm
                ? "Lass uns direkt loslegen und deinen Verein erstellen."
                : "Falls es schon eine Organisation mit deiner Domain gibt, kannst du beitreten."}
            </DialogDescription>
          </DialogHeader>

          {showCreateForm && (
            <div className="grid gap-3 mt-4">
              <Label htmlFor="name-1">Wie heißt dein Verein?</Label>
              <Input
                id="name-1"
                name="name"
                defaultValue="Young Founders Network e.V."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <DialogFooter className="mt-8">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Abbrechen
              </Button>
            </DialogClose>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCreateForm((v) => !v)}
              >
                {showCreateForm ? "Stattdessen beitreten" : "Stattdessen erstellen"}
              </Button>
              <Button type="submit">
                {showCreateForm ? "Verein erstellen" : "Beitreten"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

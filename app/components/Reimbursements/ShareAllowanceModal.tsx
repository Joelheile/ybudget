"use client";

import { DateInput } from "@/components/Selectors/DateInput";
import { SelectProject } from "@/components/Selectors/SelectProject";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Copy, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ShareAllowanceModal({ open, onClose }: Props) {
  const createLink = useMutation(api.volunteerAllowance.functions.createLink);
  const sendEmail = useMutation(
    api.volunteerAllowance.functions.sendAllowanceLink
  );
  const projects = useQuery(api.projects.queries.getBookableProjects, {});

  const [projectId, setProjectId] = useState<Id<"projects"> | null>(null);
  const [activityDescription, setActivityDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [email, setEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const projectName = projects?.find((p) => p._id === projectId)?.name ?? "";

  const reset = () => {
    setProjectId(null);
    setActivityDescription("");
    setStartDate("");
    setEndDate("");
    setEmail("");
    onClose();
  };

  const generateLink = async () => {
    if (!projectId) {
      toast.error("Bitte ein Projekt auswählen");
      return null;
    }

    const id = await createLink({
      projectId,
      activityDescription: activityDescription || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    return `${window.location.origin}/ehrenamtspauschale/${id}`;
  };

  const handleCopy = async () => {
    setIsGenerating(true);
    try {
      const link = await generateLink();
      if (!link) return;
      await navigator.clipboard.writeText(link);
      toast.success("Link kopiert");
      reset();
    } catch {
      toast.error("Fehler beim Erstellen des Links");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!email) return toast.error("Bitte E-Mail eingeben");

    setIsSending(true);
    try {
      const link = await generateLink();
      if (!link) return;
      await sendEmail({ email, link, projectName });
      toast.success("E-Mail gesendet");
      reset();
    } catch {
      toast.error("Fehler beim Senden der E-Mail");
    } finally {
      setIsSending(false);
    }
  };

  const isLoading = isGenerating || isSending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && reset()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ehrenamtspauschale teilen</DialogTitle>
          <DialogDescription>
            Erstelle einen Link oder E-mail zum Ausfüllen der
            Ehrenamtspauschale.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Projekt</Label>
            <SelectProject
              value={projectId || ""}
              onValueChange={(value) =>
                setProjectId(value ? (value as Id<"projects">) : null)
              }
            />
          </div>

          <div>
            <Label>Tätigkeitsbeschreibung</Label>
            <Textarea
              value={activityDescription}
              onChange={(e) => setActivityDescription(e.target.value)}
              placeholder="z.B. Jugendarbeit, Vorstandstätigkeit"
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Von</Label>
              <DateInput value={startDate} onChange={setStartDate} />
            </div>
            <div>
              <Label>Bis</Label>
              <DateInput value={endDate} onChange={setEndDate} />
            </div>
          </div>

          <div>
            <Label>E-Mail (optional)</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="empfaenger@beispiel.de"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCopy}
              className="flex-1"
              disabled={isLoading || !projectId}
            >
              {isGenerating ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Copy className="size-4 mr-2" />
              )}
              Link kopieren
            </Button>
            <Button
              onClick={handleSendEmail}
              className="flex-1"
              disabled={isLoading || !projectId || !email}
            >
              {isSending ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Mail className="size-4 mr-2" />
              )}
              Per E-Mail senden
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

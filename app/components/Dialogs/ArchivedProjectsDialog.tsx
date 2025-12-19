"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArchivedProjectsDialog({ open, onOpenChange }: Props) {
  const archivedProjects = useQuery(api.projects.queries.getArchivedProjects);
  const unarchiveProject = useMutation(api.projects.functions.unarchiveProject);

  const handleUnarchive = async (projectId: string) => {
    try {
      await unarchiveProject({ projectId: projectId as any });
      toast.success("Projekt wiederhergestellt");
    } catch {
      toast.error("Fehler beim Wiederherstellen");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Archivierte Projekte</DialogTitle>
        </DialogHeader>
        {archivedProjects?.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Keine archivierten Projekte
          </p>
        ) : (
          <div className="space-y-2">
            {archivedProjects?.map((project) => (
              <div
                key={project._id}
                className="flex items-center justify-between p-2 rounded-md bg-muted"
              >
                <span className="text-sm">{project.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleUnarchive(project._id)}
                >
                  Wiederherstellen
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

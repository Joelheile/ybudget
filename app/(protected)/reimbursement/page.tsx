"use client";

import { PageHeader } from "@/components/Layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatDate } from "@/lib/formatters/formatDate";
import { generateReimbursementPDF } from "@/lib/files/generateReimbursementPDF";
import { generateVolunteerAllowancePDF } from "@/lib/files/generateVolunteerAllowancePDF";
import { useIsAdmin } from "@/lib/hooks/useCurrentUserRole";
import { useConvex, useMutation, useQuery } from "convex/react";
import { Check, Download, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

type RejectDialog = {
  open: boolean;
  type: "reimbursement" | "allowance";
  id: Id<"reimbursements"> | Id<"volunteerAllowance"> | null;
  note: string;
};

export default function ReimbursementPage() {
  const isAdmin = useIsAdmin();
  const router = useRouter();
  const convex = useConvex();

  const reimbursements = useQuery(api.reimbursements.queries.getAllReimbursements);
  const allowances = useQuery(api.volunteerAllowance.queries.getAll);

  const markReimbursementPaid = useMutation(api.reimbursements.functions.markAsPaid);
  const rejectReimbursement = useMutation(api.reimbursements.functions.rejectReimbursement);
  const deleteReimbursement = useMutation(api.reimbursements.functions.deleteReimbursement);

  const approveAllowance = useMutation(api.volunteerAllowance.functions.approve);
  const rejectAllowance = useMutation(api.volunteerAllowance.functions.reject);
  const deleteAllowance = useMutation(api.volunteerAllowance.functions.remove);

  const [rejectDialog, setRejectDialog] = useState<RejectDialog>({
    open: false,
    type: "reimbursement",
    id: null,
    note: "",
  });

  const handleReject = async () => {
    if (!rejectDialog.id || !rejectDialog.note) return;

    if (rejectDialog.type === "reimbursement") {
      await rejectReimbursement({
        reimbursementId: rejectDialog.id as Id<"reimbursements">,
        rejectionNote: rejectDialog.note,
      });
    } else {
      await rejectAllowance({
        id: rejectDialog.id as Id<"volunteerAllowance">,
        rejectionNote: rejectDialog.note,
      });
    }

    setRejectDialog({ open: false, type: "reimbursement", id: null, note: "" });
    toast.success("Abgelehnt");
  };

  const handleDownloadReimbursementPDF = async (id: Id<"reimbursements">) => {
    const reimbursement = await convex.query(api.reimbursements.queries.getReimbursement, {
      reimbursementId: id,
    });
    if (!reimbursement) return;

    const receipts = await convex.query(api.reimbursements.queries.getReceipts, {
      reimbursementId: id,
    });

    const receiptsWithUrls = await Promise.all(
      receipts.map(async (receipt) => ({
        ...receipt,
        fileUrl: await convex.query(api.reimbursements.queries.getFileUrl, {
          storageId: receipt.fileStorageId,
        }),
      })),
    );

    const pdfBlob = await generateReimbursementPDF(reimbursement, receiptsWithUrls);
    downloadBlob(pdfBlob, `Erstattung_${id}.pdf`);
  };

  const handleDownloadAllowancePDF = async (
    allowance: NonNullable<typeof allowances>[number],
  ) => {
    const signatureUrl = await convex.query(api.volunteerAllowance.queries.getSignatureUrl, {
      storageId: allowance.signatureStorageId,
    });

    const pdfBlob = await generateVolunteerAllowancePDF(allowance, signatureUrl);
    downloadBlob(pdfBlob, `Ehrenamtspauschale_${allowance._id}.pdf`);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (isApproved: boolean, rejectionNote?: string) => {
    if (rejectionNote) return { variant: "destructive" as const, label: "Abgelehnt" };
    if (isApproved) return { variant: "default" as const, label: "Genehmigt" };
    return { variant: "secondary" as const, label: "Ausstehend" };
  };

  const getStatusColor = (isApproved: boolean, rejectionNote?: string) => {
    if (rejectionNote) return "bg-red-500";
    if (isApproved) return "bg-green-500";
    return "bg-yellow-500";
  };

  const isLoading = !reimbursements || !allowances;
  const isEmpty = reimbursements?.length === 0 && allowances?.length === 0;

  return (
    <div className="flex flex-col w-full h-screen">
      <PageHeader title="Erstattungen" />

      <div className="flex justify-end mb-4">
        <Button variant="secondary" onClick={() => router.push("/reimbursement/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Erstattung
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Keine Erstattungen gefunden.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px]" />
                <TableHead>Datum</TableHead>
                <TableHead>Projekt</TableHead>
                <TableHead>Beschreibung</TableHead>
                {isAdmin && <TableHead>Ersteller</TableHead>}
                <TableHead className="text-right">Betrag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {reimbursements?.map((item) => {
                const status = getStatusBadge(item.isApproved, item.rejectionNote);
                const color = getStatusColor(item.isApproved, item.rejectionNote);
                return (
                  <TableRow
                    key={item._id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/reimbursement/${item._id}`)}
                  >
                    <TableCell className="px-1">
                      <div className="flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full ${color}`} />
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(new Date(item._creationTime))}</TableCell>
                    <TableCell>{item.projectName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.type === "travel" ? (
                        <div>
                          <span>Reisekostenerstattung</span>
                          {item.travelDetails?.destination && (
                            <span className="block text-xs">{item.travelDetails.destination}</span>
                          )}
                        </div>
                      ) : (
                        "Auslagenerstattung"
                      )}
                      {item.rejectionNote && (
                        <span className="block text-xs text-red-600">
                          Ablehnung: {item.rejectionNote}
                        </span>
                      )}
                    </TableCell>
                    {isAdmin && <TableCell>{item.creatorName}</TableCell>}
                    <TableCell className="text-right font-medium">
                      {item.amount.toFixed(2)} €
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-0.5">
                        {isAdmin && !item.isApproved && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => {
                                markReimbursementPaid({ reimbursementId: item._id });
                                toast.success("Als bezahlt markiert");
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() =>
                                setRejectDialog({
                                  open: true,
                                  type: "reimbursement",
                                  id: item._id,
                                  note: "",
                                })
                              }
                              disabled={!!item.rejectionNote}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleDownloadReimbursementPDF(item._id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {isAdmin && !item.isApproved && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              deleteReimbursement({ reimbursementId: item._id });
                              toast.success("Gelöscht");
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {allowances?.map((item) => {
                const status = getStatusBadge(item.isApproved, item.rejectionNote);
                const color = getStatusColor(item.isApproved, item.rejectionNote);
                return (
                  <TableRow key={item._id}>
                    <TableCell className="px-1">
                      <div className="flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full ${color}`} />
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(new Date(item._creationTime))}</TableCell>
                    <TableCell>{item.projectName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <div>
                        <span>Ehrenamtspauschale</span>
                        <span className="block text-xs">{item.volunteerName}</span>
                      </div>
                      {item.rejectionNote && (
                        <span className="block text-xs text-red-600">
                          Ablehnung: {item.rejectionNote}
                        </span>
                      )}
                    </TableCell>
                    {isAdmin && <TableCell>{item.creatorName}</TableCell>}
                    <TableCell className="text-right font-medium">
                      {item.amount.toFixed(2)} €
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-0.5">
                        {isAdmin && !item.isApproved && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => {
                                approveAllowance({ id: item._id });
                                toast.success("Genehmigt");
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() =>
                                setRejectDialog({
                                  open: true,
                                  type: "allowance",
                                  id: item._id,
                                  note: "",
                                })
                              }
                              disabled={!!item.rejectionNote}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleDownloadAllowancePDF(item)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {isAdmin && !item.isApproved && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              deleteAllowance({ id: item._id });
                              toast.success("Gelöscht");
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => setRejectDialog({ ...rejectDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ablehnen</DialogTitle>
            <DialogDescription>Bitte gib einen Grund für die Ablehnung ein.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectDialog.note}
            onChange={(e) => setRejectDialog({ ...rejectDialog, note: e.target.value })}
            placeholder="Grund für die Ablehnung..."
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialog({ ...rejectDialog, open: false })}
            >
              Abbrechen
            </Button>
            <Button onClick={handleReject} disabled={!rejectDialog.note}>
              Ablehnen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

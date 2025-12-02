"use client";

import { PageHeader } from "@/components/Layout/PageHeader";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { EditReimbursementUI } from "./EditReimbursementUI";

interface EditReimbursementPageProps {
  reimbursementId: Id<"reimbursements">;
}

export function EditReimbursementPage({
  reimbursementId,
}: EditReimbursementPageProps) {
  const router = useRouter();

  const reimbursement = useQuery(api.reimbursements.queries.getReimbursement, {
    reimbursementId,
  });
  const receipts = useQuery(api.reimbursements.queries.getReceipts, {
    reimbursementId,
  });
  const projects = useQuery(api.projects.queries.getAllProjects);

  const updateReimbursement = useMutation(
    api.reimbursements.functions.updateReimbursement
  );
  const deleteReceipt = useMutation(api.reimbursements.functions.deleteReceipt);
  const updateReceipt = useMutation(api.reimbursements.functions.updateReceipt);
  const addReceipt = useMutation(api.reimbursements.functions.addReceipt);

  const [selectedProjectId, setSelectedProjectId] =
    useState<Id<"projects"> | null>(null);
  const [editingBank, setEditingBank] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    iban: "",
    bic: "",
    accountHolder: "",
  });

  const [editingReceiptId, setEditingReceiptId] =
    useState<Id<"receipts"> | null>(null);
  const defaultReceipt = () => ({
    receiptDate: "",
    companyName: "",
    description: "",
    grossAmount: "",
    taxRate: "19",
    receiptNumber: "",
    fileStorageId: "" as Id<"_storage"> | "",
  });

  const [editingReceipt, setEditingReceipt] = useState(defaultReceipt());
  const [showAddReceipt, setShowAddReceipt] = useState(false);
  const [newReceipt, setNewReceipt] = useState(defaultReceipt());

  const [changingImageReceiptId, setChangingImageReceiptId] =
    useState<Id<"receipts"> | null>(null);
  useEffect(() => {
    if (reimbursement) {
      setSelectedProjectId(reimbursement.projectId);
      setBankDetails({
        iban: reimbursement.iban || "",
        bic: reimbursement.bic || "",
        accountHolder: reimbursement.accountHolder || "",
      });
    }
  }, [reimbursement]);

  const calculateNetto = (brutto: string, rate: string) =>
    (parseFloat(brutto) || 0) / (1 + parseFloat(rate) / 100);
  const handleSaveProject = async (projectId: Id<"projects">) => {
    setSelectedProjectId(projectId);
    await updateReimbursement({
      reimbursementId,
      projectId,
      amount: receipts?.reduce((sum, r) => sum + r.grossAmount, 0) || 0,
    });
    toast.success("Projekt aktualisiert");
  };

  const handleSaveAll = async () => {
    if (!selectedProjectId) {
      toast.error("Bitte wählen Sie ein Projekt");
      return;
    }
    await updateReimbursement({
      reimbursementId,
      projectId: selectedProjectId,
      amount: receipts?.reduce((sum, r) => sum + r.grossAmount, 0) || 0,
    });
    toast.success("Alle Änderungen gespeichert");
    router.push("/reimbursement");
  };

  const formatReceiptForEdit = (receipt: Doc<"receipts">) => ({
    receiptDate: format(new Date(receipt.receiptDate), "yyyy-MM-dd"),
    companyName: receipt.companyName,
    description: receipt.description || "",
    grossAmount: receipt.grossAmount.toString(),
    taxRate: receipt.taxRate.toString(),
    receiptNumber: receipt.receiptNumber,
    fileStorageId: receipt.fileStorageId,
  });

  const handleEditReceipt = (receipt: Doc<"receipts">) => {
    setEditingReceiptId(receipt._id);
    setEditingReceipt(formatReceiptForEdit(receipt));
  };

  const handleImageClick = (receipt: Doc<"receipts">) => {
    setChangingImageReceiptId(receipt._id);
    setEditingReceipt(formatReceiptForEdit(receipt));
  };

  const prepareReceiptData = (receipt: typeof editingReceipt) => ({
    receiptNumber: receipt.receiptNumber,
    receiptDate: receipt.receiptDate,
    companyName: receipt.companyName,
    description: receipt.description,
    netAmount: calculateNetto(receipt.grossAmount, receipt.taxRate),
    taxRate: parseFloat(receipt.taxRate),
    grossAmount: parseFloat(receipt.grossAmount),
    fileStorageId: receipt.fileStorageId as Id<"_storage">,
  });

  const handleSaveReceipt = async () => {
    if (!editingReceiptId) return;
    await updateReceipt({
      receiptId: editingReceiptId,
      ...prepareReceiptData(editingReceipt),
    });
    setEditingReceiptId(null);
    toast.success("Beleg aktualisiert");
  };

  const handleSaveImageChange = async () => {
    if (!changingImageReceiptId) return;
    await updateReceipt({
      receiptId: changingImageReceiptId,
      ...prepareReceiptData(editingReceipt),
    });
    setChangingImageReceiptId(null);
    toast.success("Bild aktualisiert");
  };

  const handleDeleteReceipt = async (receiptId: Id<"receipts">) => {
    await deleteReceipt({ receiptId });
    toast.success("Beleg gelöscht");
  };

  const handleAddNewReceipt = async () => {
    const {
      companyName,
      receiptNumber,
      receiptDate,
      grossAmount,
      fileStorageId,
    } = newReceipt;
    if (
      !companyName ||
      !receiptNumber ||
      !receiptDate ||
      !grossAmount ||
      !fileStorageId
    ) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }
    await addReceipt({ reimbursementId, ...prepareReceiptData(newReceipt) });
    setNewReceipt(defaultReceipt());
    setShowAddReceipt(false);
    toast.success("Beleg hinzugefügt");
  };

  const totalNet = receipts?.reduce((sum, r) => sum + r.netAmount, 0) || 0;
  const totalTax7 =
    receipts
      ?.filter((r) => r.taxRate === 7)
      .reduce((sum, r) => sum + (r.grossAmount - r.netAmount), 0) || 0;
  const totalTax19 =
    receipts
      ?.filter((r) => r.taxRate === 19)
      .reduce((sum, r) => sum + (r.grossAmount - r.netAmount), 0) || 0;
  const totalGross = receipts?.reduce((sum, r) => sum + r.grossAmount, 0) || 0;

  if (!reimbursement || !receipts || !projects) {
    return (
      <div className="flex flex-col w-full h-screen">
        <PageHeader title="Erstattung bearbeiten" />
        <div className="p-6">Lädt...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen">
      <PageHeader title="Erstattung bearbeiten" showBackButton />
      <EditReimbursementUI
        projects={projects}
        receipts={receipts}
        selectedProjectId={selectedProjectId}
        bankDetails={bankDetails}
        editingBank={editingBank}
        showAddReceipt={showAddReceipt}
        editingReceiptId={editingReceiptId}
        editingReceipt={editingReceipt}
        newReceipt={newReceipt}
        changingImageReceiptId={changingImageReceiptId}
        changingImageReceipt={changingImageReceiptId ? editingReceipt : null}
        totalNet={totalNet}
        totalTax7={totalTax7}
        totalTax19={totalTax19}
        totalGross={totalGross}
        onProjectChange={handleSaveProject}
        onBankDetailsChange={setBankDetails}
        onEditBankToggle={() => {
          setEditingBank(!editingBank);
          if (editingBank) toast.success("Bankdaten aktualisiert");
        }}
        onAddReceiptToggle={() => setShowAddReceipt(true)}
        onEditReceipt={handleEditReceipt}
        onDeleteReceipt={handleDeleteReceipt}
        onImageClick={handleImageClick}
        onSaveReceipt={handleSaveReceipt}
        onAddNewReceipt={handleAddNewReceipt}
        onCancelEdit={() => {
          setEditingReceiptId(null);
          setShowAddReceipt(false);
        }}
        onSaveImageChange={handleSaveImageChange}
        onCancelImageChange={() => setChangingImageReceiptId(null)}
        onSaveAll={handleSaveAll}
        setEditingReceipt={setEditingReceipt}
        setNewReceipt={setNewReceipt}
        setChangingImageReceipt={setEditingReceipt}
      />
    </div>
  );
}

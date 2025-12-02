"use client";

import { PageHeader } from "@/components/Layout/PageHeader";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { EditReimbursementUI } from "./EditReimbursementUI";

const emptyReceipt = {
  receiptDate: "",
  companyName: "",
  description: "",
  grossAmount: "",
  taxRate: "19",
  receiptNumber: "",
  fileStorageId: "" as Id<"_storage"> | "",
};

export default function EditReimbursementPage() {
  const params = useParams();
  const reimbursementId = params.id as Id<"reimbursements">;
  const router = useRouter();

  const reimbursement = useQuery(api.reimbursements.queries.getReimbursement, {
    reimbursementId,
  });
  const receipts = useQuery(api.reimbursements.queries.getReceipts, {
    reimbursementId,
  });
  const projects = useQuery(api.projects.queries.getAllProjects);

  const updateReimbursement = useMutation(
    api.reimbursements.functions.updateReimbursement,
  );
  const deleteReceiptMutation = useMutation(
    api.reimbursements.functions.deleteReceipt,
  );
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

  const [editMode, setEditMode] = useState<"list" | "add" | "edit" | "image">(
    "list",
  );
  const [editingReceiptId, setEditingReceiptId] =
    useState<Id<"receipts"> | null>(null);
  const [formData, setFormData] = useState(emptyReceipt);

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

  const formatReceiptForEdit = (receipt: Doc<"receipts">) => ({
    receiptDate: format(new Date(receipt.receiptDate), "yyyy-MM-dd"),
    companyName: receipt.companyName,
    description: receipt.description || "",
    grossAmount: receipt.grossAmount.toString(),
    taxRate: receipt.taxRate.toString(),
    receiptNumber: receipt.receiptNumber,
    fileStorageId: receipt.fileStorageId,
  });

  const prepareReceiptData = () => ({
    receiptNumber: formData.receiptNumber,
    receiptDate: formData.receiptDate,
    companyName: formData.companyName,
    description: formData.description,
    netAmount: calculateNetto(formData.grossAmount, formData.taxRate),
    taxRate: parseFloat(formData.taxRate),
    grossAmount: parseFloat(formData.grossAmount),
    fileStorageId: formData.fileStorageId as Id<"_storage">,
  });

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

  const handleEditReceipt = (receipt: Doc<"receipts">) => {
    setEditingReceiptId(receipt._id);
    setFormData(formatReceiptForEdit(receipt));
    setEditMode("edit");
  };

  const handleImageClick = (receipt: Doc<"receipts">) => {
    setEditingReceiptId(receipt._id);
    setFormData(formatReceiptForEdit(receipt));
    setEditMode("image");
  };

  const handleSave = async () => {
    if (!editingReceiptId) return;
    await updateReceipt({
      receiptId: editingReceiptId,
      ...prepareReceiptData(),
    });
    setEditMode("list");
    setEditingReceiptId(null);
    toast.success(
      editMode === "image" ? "Bild aktualisiert" : "Beleg aktualisiert",
    );
  };

  const handleDeleteReceipt = async (receiptId: Id<"receipts">) => {
    await deleteReceiptMutation({ receiptId });
    toast.success("Beleg gelöscht");
  };

  const handleAddNewReceipt = async () => {
    const {
      companyName,
      receiptNumber,
      receiptDate,
      grossAmount,
      fileStorageId,
    } = formData;
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
    await addReceipt({ reimbursementId, ...prepareReceiptData() });
    setFormData(emptyReceipt);
    setEditMode("list");
    toast.success("Beleg hinzugefügt");
  };

  const handleCancel = () => {
    setEditMode("list");
    setEditingReceiptId(null);
    setFormData(emptyReceipt);
  };

  const handleStartAdd = () => {
    setFormData(emptyReceipt);
    setEditMode("add");
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
        editMode={editMode}
        formData={formData}
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
        onAddReceiptToggle={handleStartAdd}
        onEditReceipt={handleEditReceipt}
        onDeleteReceipt={handleDeleteReceipt}
        onImageClick={handleImageClick}
        onSave={handleSave}
        onAddNewReceipt={handleAddNewReceipt}
        onCancel={handleCancel}
        onSaveAll={handleSaveAll}
        setFormData={setFormData}
      />
    </div>
  );
}

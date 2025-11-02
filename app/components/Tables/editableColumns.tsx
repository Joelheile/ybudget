"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, Check, MoreHorizontal, X } from "lucide-react";
import {
  EditableAmountCell,
  EditableCategoryCell,
  EditableDateCell,
  EditableProjectCell,
  EditableSelectCell,
  EditableTextareaCell,
} from "./EditableCells";

const getEditingState = (row: any, table: any) => {
  const rowId = row.original._id;
  const status = row.original.status;
  const isPlanned = status === "expected";
  const isRowEditing = table.options.meta?.editingRows?.has(rowId) || false;
  return { rowId, status, isPlanned, isRowEditing };
};

const createEditableCellHandlers = (rowId: string, table: any) => {
  return {
    handleSave: (field: string) => (value: any) => {
      table.options.meta?.onUpdate(rowId, field, value);
    },
    handleCancel: () => {
      table.options.meta?.onCancelRow(rowId);
    },
    handleEdit: () => {},
  };
};

export const editableColumns = [
  {
    id: "indicator",
    cell: ({ row }: any) => {
      const amount = row.getValue("amount");
      const dotColor = amount < 0 ? "bg-red-500" : "bg-green-500";
      return (
        <div className="flex items-center px-1 justify-center">
          <div className={`w-2 h-2 rounded-full ${dotColor}`} />
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: ({ column }: any) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting()}
          className="h-8 px-2"
        >
          Datum
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row, table }: any) => {
      const { rowId, isPlanned, isRowEditing } = getEditingState(row, table);
      const handlers = createEditableCellHandlers(rowId, table);

      if (isPlanned && isRowEditing) {
        return (
          <div className="pl-2">
            <EditableDateCell
              value={row.getValue("date")}
              onSave={handlers.handleSave("date")}
              onCancel={handlers.handleCancel}
              isEditing={true}
              onEdit={handlers.handleEdit}
            />
          </div>
        );
      }

      const dateValue = row.getValue("date");
      const formattedDate = dateValue
        ? new Date(dateValue).toLocaleDateString("de-DE")
        : "";

      return <div className="pl-2">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "projectName",
    header: "Projekt",
    cell: ({ row, table }: any) => {
      const { rowId, isPlanned, isRowEditing } = getEditingState(row, table);
      const handlers = createEditableCellHandlers(rowId, table);

      if (isPlanned && isRowEditing) {
        return (
          <EditableProjectCell
            value={row.original.projectId}
            displayValue={row.original.projectName}
            onSave={handlers.handleSave("projectId")}
            onCancel={handlers.handleCancel}
            isEditing={true}
            onEdit={handlers.handleEdit}
          />
        );
      }

      return (
        <div className="p-1">
          {row.original.projectName || row.original.projectId || ""}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Beschreibung",
    cell: ({ row, table }: any) => {
      const { rowId, isPlanned, isRowEditing } = getEditingState(row, table);
      const handlers = createEditableCellHandlers(rowId, table);

      if (isPlanned && isRowEditing) {
        return (
          <EditableTextareaCell
            value={row.getValue("description") || row.original.reference || ""}
            onSave={handlers.handleSave("description")}
            onCancel={handlers.handleCancel}
            isEditing={true}
            onEdit={handlers.handleEdit}
          />
        );
      }

      const description =
        row.getValue("description") || row.original.reference || "";

      return (
        <div className="max-w-64 min-w-32">
          <div className="whitespace-pre-wrap text-muted-foreground break-words text-sm">
            {description}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "categoryName",
    header: "Kategorie",
    cell: ({ row, table }: any) => {
      const { rowId, isPlanned, isRowEditing } = getEditingState(row, table);
      const handlers = createEditableCellHandlers(rowId, table);

      if (isPlanned && isRowEditing) {
        return (
          <EditableCategoryCell
            value={row.original.categoryId}
            onSave={handlers.handleSave("categoryId")}
            onCancel={handlers.handleCancel}
            isEditing={true}
            onEdit={handlers.handleEdit}
          />
        );
      }

      return (
        <div className="p-1">
          {row.original.categoryName || row.original.categoryId || ""}
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }: any) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting()}
          className="h-8 px-2 w-full justify-end"
        >
          Betrag
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row, table }: any) => {
      const { rowId, isPlanned, isRowEditing } = getEditingState(row, table);
      const handlers = createEditableCellHandlers(rowId, table);

      if (isPlanned && isRowEditing) {
        return (
          <div className="flex justify-end pr-2">
            <EditableAmountCell
              value={row.getValue("amount")}
              onSave={handlers.handleSave("amount")}
              onCancel={handlers.handleCancel}
              isEditing={true}
              onEdit={handlers.handleEdit}
            />
          </div>
        );
      }

      const amount = row.getValue("amount");
      const formattedAmount = new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
      }).format(Math.abs(amount));
      const displayAmount =
        amount < 0 ? `- ${formattedAmount}` : `+ ${formattedAmount}`;

      return <div className="text-right font-medium pr-2">{displayAmount}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row, table }: any) => {
      const { rowId, isPlanned, isRowEditing } = getEditingState(row, table);
      const status = row.getValue("status");
      const handlers = createEditableCellHandlers(rowId, table);

      if (isPlanned && isRowEditing) {
        return (
          <EditableSelectCell
            value={status}
            onSave={handlers.handleSave("status")}
            onCancel={handlers.handleCancel}
            isEditing={true}
            onEdit={handlers.handleEdit}
            options={[
              { value: "expected", label: "Geplant" },
              { value: "processed", label: "Abgerechnet" },
            ]}
          />
        );
      }

      const variant =
        status === "processed" ? "default" : ("secondary" as const);
      const displayText = status === "processed" ? "Abgerechnet" : "Geplant";

      return <Badge variant={variant}>{displayText}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row, table }: any) => {
      const { rowId, isPlanned, isRowEditing } = getEditingState(row, table);
      const isUpdating = table.options.meta?.isUpdating || false;

      const handleEditClick = () => {
        if (isPlanned && !isRowEditing) {
          table.options.meta?.setEditingRows((prev: Set<string>) => {
            const updated = new Set(prev);
            updated.add(rowId);
            return updated;
          });
        }
      };

      const handleSaveClick = async () => {
        await table.options.meta?.onSaveRow(rowId);
      };

      const handleCancelClick = () => {
        table.options.meta?.onCancelRow(rowId);
      };

      if (isRowEditing) {
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveClick}
              disabled={isUpdating}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelClick}
              disabled={isUpdating}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        );
      }

      if (!isPlanned) {
        return null;
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEditClick}>
              Bearbeiten
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

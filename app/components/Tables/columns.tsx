"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowUpDown, Check, Edit, X } from "lucide-react";
import {
  EditableAmountCell,
  EditableCategoryCell,
  EditableDateCellWithCalendar,
  EditableProjectCell,
  EditableTextareaCell,
} from "./EditableCells";

function startEditing(meta: any, rowId: string) {
  const setEditingRows = meta?.setEditingRows;
  if (setEditingRows && typeof setEditingRows === "function") {
    setEditingRows((prev: Set<string>) => {
      const newSet = new Set(prev);
      newSet.add(rowId);
      return newSet;
    });
  }
}

export const columns = [
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
      const status = row.getValue("status");
      const date = row.getValue("date");
      const dateValue = typeof date === "number" ? new Date(date) : date;
      const rowId = row.original._id;
      const isEditing = table.options.meta?.editingRows?.has(rowId);
      const pendingChanges = table.options.meta?.pendingChanges?.[rowId];

      if (status === "expected") {
        return (
          <div className="pl-2">
            <EditableDateCellWithCalendar
              value={date}
              pendingValue={pendingChanges?.date}
              onSave={(value) =>
                table.options.meta?.onUpdate(rowId, "date", value)
              }
              onCancel={() => table.options.meta?.onCancelRow(rowId)}
              isEditing={isEditing || false}
              onEdit={() => startEditing(table.options.meta, rowId)}
            />
          </div>
        );
      }

      return <div className="pl-2">{format(dateValue, "dd.MM.yyyy")}</div>;
    },
  },
  {
    accessorKey: "projectName",
    header: "Projekt",
    cell: ({ row, table }: any) => {
      const status = row.getValue("status");
      const rowId = row.original._id;
      const isEditing = table.options.meta?.editingRows?.has(rowId);
      const pendingChanges = table.options.meta?.pendingChanges?.[rowId];

      if (status === "processed" || status === "expected") {
        return (
          <EditableProjectCell
            value={row.original.projectId}
            pendingValue={pendingChanges?.projectId}
            onSave={(value) =>
              table.options.meta?.onUpdate(rowId, "projectId", value)
            }
            onCancel={() => table.options.meta?.onCancelRow(rowId)}
            isEditing={isEditing || false}
            onEdit={() => startEditing(table.options.meta, rowId)}
            displayValue={row.getValue("projectName")}
          />
        );
      }

      return <div>{row.getValue("projectName") || ""}</div>;
    },
  },
  {
    accessorKey: "description",
    header: "Beschreibung",
    cell: ({ row, table }: any) => {
      const status = row.getValue("status");
      const description =
        row.getValue("description") || row.original.reference || "";
      const rowId = row.original._id;
      const isEditing = table.options.meta?.editingRows?.has(rowId);
      const pendingChanges = table.options.meta?.pendingChanges?.[rowId];

      if (status === "expected") {
        return (
          <EditableTextareaCell
            value={description}
            pendingValue={pendingChanges?.description}
            onSave={(value) =>
              table.options.meta?.onUpdate(rowId, "description", value)
            }
            onCancel={() => table.options.meta?.onCancelRow(rowId)}
            isEditing={isEditing || false}
            onEdit={() => startEditing(table.options.meta, rowId)}
          />
        );
      }

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
      const status = row.getValue("status");
      const rowId = row.original._id;
      const isEditing = table.options.meta?.editingRows?.has(rowId);
      const pendingChanges = table.options.meta?.pendingChanges?.[rowId];

      if (status === "processed" || status === "expected") {
        return (
          <EditableCategoryCell
            value={row.original.categoryId}
            pendingValue={pendingChanges?.categoryId}
            onSave={(value) =>
              table.options.meta?.onUpdate(rowId, "categoryId", value)
            }
            onCancel={() => table.options.meta?.onCancelRow(rowId)}
            isEditing={isEditing || false}
            onEdit={() => startEditing(table.options.meta, rowId)}
            displayValue={row.getValue("categoryName")}
          />
        );
      }

      return <div>{row.getValue("categoryName") || ""}</div>;
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
      const status = row.getValue("status");
      const amount = row.getValue("amount");
      const rowId = row.original._id;
      const isEditing = table.options.meta?.editingRows?.has(rowId);
      const pendingChanges = table.options.meta?.pendingChanges?.[rowId];

      if (status === "expected") {
        return (
          <div className="pr-2">
            <EditableAmountCell
              value={amount}
              pendingValue={pendingChanges?.amount}
              onSave={(value) =>
                table.options.meta?.onUpdate(rowId, "amount", value)
              }
              onCancel={() => table.options.meta?.onCancelRow(rowId)}
              isEditing={isEditing || false}
              onEdit={() => startEditing(table.options.meta, rowId)}
            />
          </div>
        );
      }

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
    cell: ({ row }: any) => {
      const status = row.getValue("status");

      let variant: "default" | "secondary" | "destructive" | "outline" =
        "secondary";
      let displayText = "Geplant";

      if (status === "processed") {
        variant = "default";
        displayText = "Abgerechnet";
      } else if (status === "expected") {
        variant = "secondary";
        displayText = "Geplant";
      }

      return <Badge variant={variant}>{displayText}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row, table }: any) => {
      const status = row.getValue("status");
      const rowId = row.original._id;
      const isEditing = table.options.meta?.editingRows?.has(rowId);
      const pendingChanges = table.options.meta?.pendingChanges?.[rowId];
      const hasPendingChanges =
        pendingChanges && Object.keys(pendingChanges).length > 0;
      const isUpdating = table.options.meta?.isUpdating;

      if (status === "processed" || status === "expected") {
        if (isEditing) {
          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => table.options.meta?.onSaveRow(rowId)}
                disabled={!hasPendingChanges || isUpdating}
              >
                <Check className="h-4 w-4 mr-1" />
                Speichern
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => table.options.meta?.onCancelRow(rowId)}
                disabled={isUpdating}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        }

        return (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => startEditing(table.options.meta, rowId)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        );
      }

      return null;
    },
  },
];

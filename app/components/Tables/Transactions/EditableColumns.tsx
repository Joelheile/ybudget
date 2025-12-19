"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters/formatCurrency";
import { formatDate } from "@/lib/formatters/formatDate";
import type { EnrichedTransaction } from "@/lib/transactionFilters";
import type { Column, Row, Table } from "@tanstack/react-table";
import { ArrowUpDown, Check, Pencil, Trash2, X } from "lucide-react";
import {
  EditableAmountCell,
  EditableCategoryCell,
  EditableDateCell,
  EditableProjectCell,
  EditableTextareaCell,
  EditableTextCell,
} from "./EditableCells";
import type { TableMeta } from "./EditableDataTable";

type TransactionRow = Row<EnrichedTransaction>;
type TransactionTable = Table<EnrichedTransaction>;

function SortableHeader({
  column,
  label,
}: {
  column: Column<EnrichedTransaction>;
  label: string;
}) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting()}
      className="h-8 px-2"
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

function getEditState(row: TransactionRow, table: TransactionTable) {
  const meta = table.options.meta as TableMeta | undefined;
  const rowId = row.original._id;
  const isPlanned = row.original.status === "expected";
  const isEditing = meta?.editingRows?.has(rowId);

  function onFieldChange(field: string, value: unknown) {
    meta?.onFieldChange(rowId, field, value);
  }

  return { rowId, isPlanned, isEditing, onFieldChange, meta };
}

function ActionsCell({
  row,
  table,
}: {
  row: TransactionRow;
  table: TransactionTable;
}) {
  const { rowId, isPlanned, isEditing, meta } = getEditState(row, table);

  if (!isEditing) {
    return (
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            meta?.setEditingRows((prev) => new Set(prev).add(rowId))
          }
          className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => meta?.onSave(rowId)}
        className="h-8 w-8 p-0 text-green-500 hover:text-green-600"
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => meta?.onStopEditing(rowId)}
        className="h-8 w-8 p-0 text-red-400 hover:text-red-500"
      >
        <X className="h-4 w-4" />
      </Button>
      {isPlanned && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => meta?.onDelete(rowId)}
          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function StatusCell({ row }: { row: TransactionRow }) {
  const isTransfer = !!row.original.transferId;
  const status = row.original.status;

  if (isTransfer) {
    return <Badge variant="outline">Budget</Badge>;
  }
  if (status === "expected") {
    return <Badge variant="secondary">Geplant</Badge>;
  }
  return <Badge variant="default">Abgerechnet</Badge>;
}

const baseColumns = [
  {
    id: "indicator",
    cell: ({ row }: { row: TransactionRow }) => (
      <div className="flex items-center px-1 justify-center">
        <div
          className={`w-2 h-2 rounded-full ${
            row.original.amount < 0 ? "bg-red-500" : "bg-green-500"
          }`}
        />
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: ({ column }: { column: Column<EnrichedTransaction> }) => (
      <SortableHeader column={column} label="Datum" />
    ),
    cell: ({ row, table }: { row: TransactionRow; table: TransactionTable }) => {
      const { isPlanned, isEditing, onFieldChange } = getEditState(row, table);

      if (isPlanned && isEditing) {
        return (
          <div className="pl-2">
            <EditableDateCell
              value={row.original.date}
              onSave={(value) => onFieldChange("date", value)}
            />
          </div>
        );
      }
      return <div className="pl-2">{formatDate(row.original.date)}</div>;
    },
  },
  {
    accessorKey: "counterparty",
    header: "Gegenpartei",
    cell: ({ row, table }: { row: TransactionRow; table: TransactionTable }) => {
      const { isPlanned, isEditing, onFieldChange } = getEditState(row, table);

      if (isPlanned && isEditing) {
        return (
          <EditableTextCell
            value={row.original.counterparty || ""}
            onSave={(value) => onFieldChange("counterparty", value)}
          />
        );
      }
      return (
        <div className="p-1 min-w-48 max-w-64 truncate">
          {row.original.counterparty || ""}
        </div>
      );
    },
  },
  {
    accessorKey: "projectName",
    header: "Projekt",
    cell: ({ row, table }: { row: TransactionRow; table: TransactionTable }) => {
      const { isPlanned, isEditing, onFieldChange } = getEditState(row, table);

      if (isPlanned && isEditing) {
        return (
          <EditableProjectCell
            value={row.original.projectId}
            onSave={(value) => onFieldChange("projectId", value)}
          />
        );
      }
      return (
        <div className="p-1 min-w-40 max-w-64 truncate">
          {row.original.projectName || ""}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Beschreibung",
    cell: ({ row, table }: { row: TransactionRow; table: TransactionTable }) => {
      const { isEditing, onFieldChange } = getEditState(row, table);
      const description = row.original.description || "";

      if (isEditing) {
        return (
          <EditableTextareaCell
            value={description}
            onSave={(value) => onFieldChange("description", value)}
          />
        );
      }
      return (
        <div className="min-w-48 max-w-96 text-muted-foreground text-sm truncate">
          {description}
        </div>
      );
    },
  },
  {
    accessorKey: "categoryName",
    header: "Kategorie",
    cell: ({ row, table }: { row: TransactionRow; table: TransactionTable }) => {
      const { isEditing, onFieldChange } = getEditState(row, table);

      if (isEditing) {
        return (
          <EditableCategoryCell
            value={row.original.categoryId}
            onSave={(value) => onFieldChange("categoryId", value)}
          />
        );
      }
      return (
        <div className="p-1 min-w-32 max-w-48 truncate">
          {row.original.categoryName || ""}
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }: { column: Column<EnrichedTransaction> }) => (
      <div className="flex justify-end">
        <SortableHeader column={column} label="Betrag" />
      </div>
    ),
    cell: ({ row, table }: { row: TransactionRow; table: TransactionTable }) => {
      const { isPlanned, isEditing, onFieldChange } = getEditState(row, table);
      const amount = row.original.amount;

      if (isPlanned && isEditing) {
        return (
          <div className="flex justify-end pr-2">
            <EditableAmountCell
              value={amount}
              onSave={(value) => onFieldChange("amount", value)}
            />
          </div>
        );
      }
      return (
        <div className="text-right font-medium pr-2 whitespace-nowrap">
          {formatCurrency(amount)}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="text-right">Status</div>,
    cell: ({ row }: { row: TransactionRow }) => (
      <div className="flex justify-end">
        <StatusCell row={row} />
      </div>
    ),
  },
  {
    id: "actions",
    cell: ActionsCell,
  },
];

export const editableColumns = baseColumns;

export const editableColumnsWithoutProject = baseColumns.filter(
  (column) => column.accessorKey !== "projectName"
);

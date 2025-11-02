"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  EditableCategoryCell,
  EditableDateCell,
  EditableProjectCell,
} from "./EditableCells";

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
      const rowId = row.original._id;
      const cellId = `${rowId}-date`;
      const isEditing = table.options.meta?.editingCell === cellId;

      const handleSave = (value: any) => {
        table.options.meta?.onUpdate(rowId, "date", value);
      };

      const handleCancel = () => {
        table.options.meta?.setEditingCell(null);
      };

      const handleEdit = () => {
        table.options.meta?.setEditingCell(cellId);
      };

      return (
        <div className="pl-2">
          <EditableDateCell
            value={row.getValue("date")}
            onSave={handleSave}
            onCancel={handleCancel}
            isEditing={isEditing}
            onEdit={handleEdit}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "projectName",
    header: "Projekt",
    cell: ({ row, table }: any) => {
      const rowId = row.original._id;
      const cellId = `${rowId}-projectId`;
      const isEditing = table.options.meta?.editingCell === cellId;

      const handleSave = (value: any) => {
        table.options.meta?.onUpdate(rowId, "projectId", value);
      };

      const handleCancel = () => {
        table.options.meta?.setEditingCell(null);
      };

      const handleEdit = () => {
        table.options.meta?.setEditingCell(cellId);
      };

      return (
        <EditableProjectCell
          value={row.original.projectId}
          displayValue={row.original.projectName}
          onSave={handleSave}
          onCancel={handleCancel}
          isEditing={isEditing}
          onEdit={handleEdit}
        />
      );
    },
  },
  {
    accessorKey: "description",
    header: "Beschreibung",
    cell: ({ row }: any) => {
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
      const rowId = row.original._id;
      const cellId = `${rowId}-categoryId`;
      const isEditing = table.options.meta?.editingCell === cellId;

      const handleSave = (value: any) => {
        table.options.meta?.onUpdate(rowId, "categoryId", value);
      };

      const handleCancel = () => {
        table.options.meta?.setEditingCell(null);
      };

      const handleEdit = () => {
        table.options.meta?.setEditingCell(cellId);
      };

      return (
        <EditableCategoryCell
          value={row.original.categoryId}
          onSave={handleSave}
          onCancel={handleCancel}
          isEditing={isEditing}
          onEdit={handleEdit}
        />
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
    cell: ({ row }: any) => {
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
      const rowId = row.original._id;
      const isEditing = table.options.meta?.editingCell?.startsWith(rowId);

      const handleEditClick = () => {
        if (!isEditing) {
          table.options.meta?.setEditingCell(`${rowId}-projectId`);
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEditClick} disabled={isEditing}>
              {isEditing ? "Bearbeitung aktiv..." : "Bearbeiten"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

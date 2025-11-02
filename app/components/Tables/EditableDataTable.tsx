"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";

interface EditableDataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  onUpdate?: (rowId: string, field: string, value: any) => Promise<void>;
}

export function EditableDataTable<T extends { _id: string }>({
  columns,
  data,
  onUpdate,
}: EditableDataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);
  const [visibleRows, setVisibleRows] = useState(20);
  const [editingRows, setEditingRows] = useState<Set<string>>(new Set());
  const [pendingChanges, setPendingChanges] = useState<
    Record<string, Record<string, any>>
  >({});
  const [isUpdating, setIsUpdating] = useState(false);
  const scrollRef = useRef<HTMLTableRowElement>(null);

  const updatePendingChanges = (rowId: string, field: string, value: any) => {
    setPendingChanges((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [field]: value,
      },
    }));
  };

  const saveRow = async (rowId: string) => {
    const changes = pendingChanges[rowId];
    if (!changes || Object.keys(changes).length === 0) return;
    if (!onUpdate) return;

    setIsUpdating(true);
    try {
      for (const [field, value] of Object.entries(changes)) {
        await onUpdate(rowId, field, value);
      }
      setPendingChanges((prev) => {
        const updated = { ...prev };
        delete updated[rowId];
        return updated;
      });
      setEditingRows((prev) => {
        const updated = new Set(prev);
        updated.delete(rowId);
        return updated;
      });
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelRow = (rowId: string) => {
    setPendingChanges((prev) => {
      const updated = { ...prev };
      delete updated[rowId];
      return updated;
    });
    setEditingRows((prev) => {
      const updated = new Set(prev);
      updated.delete(rowId);
      return updated;
    });
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
    meta: {
      editingRows,
      setEditingRows,
      pendingChanges,
      setPendingChanges,
      onUpdate: updatePendingChanges,
      onSaveRow: saveRow,
      onCancelRow: cancelRow,
      isUpdating,
    },
  });

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const totalRows = table.getRowModel().rows.length;
        if (visibleRows < totalRows) {
          setVisibleRows(visibleRows + 20);
        }
      }
    });

    if (scrollRef.current) {
      observer.observe(scrollRef.current);
    }

    return () => observer.disconnect();
  }, [visibleRows, table]);

  const rows = table.getRowModel().rows.slice(0, visibleRows);

  return (
    <div className="rounded-md border overflow-x-auto w-full">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length > 0 ? (
            <>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              <tr ref={scrollRef} />
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Keine Ergebnisse
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

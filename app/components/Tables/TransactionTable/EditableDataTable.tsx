"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

interface EditableDataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  onUpdate?: (rowId: string, field: string, value: any) => Promise<void>;
  onDelete?: (rowId: string) => Promise<void>;
  paginationStatus?: "Loading" | "LoadingMore" | "CanLoadMore" | "Exhausted" | "LoadingFirstPage";
  loadMore?: () => void;
}

export function EditableDataTable<T extends { _id: string }>({
  columns,
  data,
  onUpdate,
  onDelete,
  paginationStatus,
  loadMore,
}: EditableDataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }]);
  const [editingRows, setEditingRows] = useState<Set<string>>(new Set());
  const [isUpdating, setIsUpdating] = useState(false);
  const scrollRef = useRef<HTMLTableRowElement>(null);

  const hasNextPage = paginationStatus === "CanLoadMore";
  const isLoading = paginationStatus === "LoadingMore" || paginationStatus === "LoadingFirstPage";

  const stopEditing = (rowId: string) => {
    setEditingRows((prev) => {
      const updated = new Set(prev);
      updated.delete(rowId);
      return updated;
    });
  };

  const handleUpdate = async (rowId: string, field: string, value: any) => {
    if (!onUpdate) return;
    setIsUpdating(true);
    try {
      await onUpdate(rowId, field, value);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (rowId: string) => {
    if (!onDelete) return;
    setIsUpdating(true);
    try {
      await onDelete(rowId);
      stopEditing(rowId);
      toast.success("Transaktion erfolgreich gelöscht");
    } catch {
      toast.error("Fehler beim Löschen der Transaktion");
    } finally {
      setIsUpdating(false);
    }
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
      onUpdate: handleUpdate,
      onStopEditing: stopEditing,
      onDelete: handleDelete,
      isUpdating,
    },
  });

  useEffect(() => {
    if (!scrollRef.current || !hasNextPage || isLoading || !loadMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore();
    });
    observer.observe(scrollRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isLoading, loadMore]);

  const rows = table.getRowModel().rows;

  return (
    <div className="rounded-md border overflow-x-auto w-full">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          <TableContent
            rows={rows}
            columns={columns}
            isLoading={isLoading}
            hasNextPage={hasNextPage}
            scrollRef={scrollRef}
          />
        </TableBody>
      </Table>
    </div>
  );
}

function TableContent({
  rows,
  columns,
  isLoading,
  hasNextPage,
  scrollRef,
}: {
  rows: any[];
  columns: any[];
  isLoading: boolean;
  hasNextPage: boolean;
  scrollRef: React.RefObject<HTMLTableRowElement | null>;
}) {
  if (rows.length > 0) {
    return (
      <>
        {rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell: any) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
        {hasNextPage && (
          <TableRow ref={scrollRef}>
            <TableCell colSpan={columns.length} className="h-16 text-center">
              {isLoading ? "Lade mehr..." : ""}
            </TableCell>
          </TableRow>
        )}
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        {[1, 2, 3, 4, 5].map((i) => (
          <TableRow key={i}>
            {columns.map((_, j) => (
              <TableCell key={j}>
                <Skeleton className="h-4 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </>
    );
  }

  return (
    <TableRow>
      <TableCell colSpan={columns.length} className="h-24 text-center">
        Keine Ergebnisse
      </TableCell>
    </TableRow>
  );
}

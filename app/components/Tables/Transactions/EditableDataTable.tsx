"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EnrichedTransaction } from "@/lib/transactionFilters";
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

export interface TableMeta {
  editingRows: Set<string>;
  setEditingRows: React.Dispatch<React.SetStateAction<Set<string>>>;
  pendingChanges: Map<string, Record<string, unknown>>;
  onFieldChange: (rowId: string, field: string, value: unknown) => void;
  onSave: (rowId: string) => void;
  onStopEditing: (rowId: string) => void;
  onDelete: (rowId: string) => void;
  isUpdating: boolean;
}

interface Props {
  columns: ColumnDef<EnrichedTransaction>[];
  data: EnrichedTransaction[];
  onUpdate?: (rowId: string, field: string, value: unknown) => Promise<void>;
  onDelete?: (rowId: string) => Promise<void>;
  paginationStatus?: string;
  loadMore?: () => void;
}

export function EditableDataTable({
  columns,
  data,
  onUpdate,
  onDelete,
  paginationStatus,
  loadMore,
}: Props) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);
  const [editingRows, setEditingRows] = useState<Set<string>>(new Set());
  const [pendingChanges, setPendingChanges] = useState<
    Map<string, Record<string, unknown>>
  >(new Map());
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLTableRowElement>(null);

  const hasNextPage = paginationStatus === "CanLoadMore";
  const isLoading =
    paginationStatus === "LoadingMore" ||
    paginationStatus === "LoadingFirstPage";

  function startEditing(rowId: string) {
    setEditingRows((prev) => new Set(prev).add(rowId));
  }

  function stopEditing(rowId: string) {
    setEditingRows((prev) => {
      const next = new Set(prev);
      next.delete(rowId);
      return next;
    });
    setPendingChanges((prev) => {
      const next = new Map(prev);
      next.delete(rowId);
      return next;
    });
  }

  function handleFieldChange(rowId: string, field: string, value: unknown) {
    setPendingChanges((prev) => {
      const next = new Map(prev);
      const rowChanges = next.get(rowId) || {};
      next.set(rowId, { ...rowChanges, [field]: value });
      return next;
    });
  }

  async function handleSave(rowId: string) {
    if (!onUpdate) return;

    const changes = pendingChanges.get(rowId);
    if (!changes || Object.keys(changes).length === 0) {
      stopEditing(rowId);
      return;
    }

    setIsUpdating(true);
    try {
      for (const [field, value] of Object.entries(changes)) {
        await onUpdate(rowId, field, value);
      }
      stopEditing(rowId);
      toast.success("Gespeichert");
    } catch {
      toast.error("Fehler beim Speichern");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete() {
    if (!onDelete || !deleteRowId) return;

    setIsUpdating(true);
    try {
      await onDelete(deleteRowId);
      stopEditing(deleteRowId);
      toast.success("Transaktion gelöscht");
    } catch {
      toast.error("Fehler beim Löschen");
    } finally {
      setIsUpdating(false);
      setDeleteRowId(null);
    }
  }

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
      onFieldChange: handleFieldChange,
      onSave: handleSave,
      onStopEditing: stopEditing,
      onDelete: setDeleteRowId,
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
    <>
      <div className="rounded-md border overflow-x-auto w-full">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              <>
                {rows.map((row) => {
                  const rowId = row.original._id;
                  const isEditing = editingRows.has(rowId);
                  return (
                    <TableRow
                      key={row.id}
                      onDoubleClick={() => !isEditing && startEditing(rowId)}
                      className={isEditing ? "" : "cursor-pointer"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
                {hasNextPage && (
                  <TableRow ref={scrollRef}>
                    <TableCell
                      colSpan={columns.length}
                      className="h-16 text-center"
                    >
                      {isLoading ? "Lade mehr..." : ""}
                    </TableCell>
                  </TableRow>
                )}
              </>
            ) : isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: columns.length }).map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Keine Ergebnisse
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!deleteRowId}
        onOpenChange={(open) => !open && setDeleteRowId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transaktion löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

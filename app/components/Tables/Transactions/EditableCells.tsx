"use client";

import { SelectCategory } from "@/components/Selectors/SelectCategory";
import { SelectProject } from "@/components/Selectors/SelectProject";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useState } from "react";

interface NumberCellProps {
  value: number;
  onSave: (value: number) => void;
}

interface StringCellProps {
  value: string | undefined;
  onSave: (value: string) => void;
}

export function EditableAmountCell({ value, onSave }: NumberCellProps) {
  const [editValue, setEditValue] = useState(Math.abs(value || 0).toString());

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEditValue(e.target.value);
    const numValue = parseFloat(e.target.value);
    if (!isNaN(numValue)) {
      onSave(value < 0 ? -Math.abs(numValue) : Math.abs(numValue));
    }
  }

  return (
    <Input
      type="number"
      value={editValue}
      onChange={handleChange}
      className="h-8 w-24 text-right [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      autoFocus
      step="0.01"
    />
  );
}

export function EditableDateCell({ value, onSave }: NumberCellProps) {
  const dateValue = value ? new Date(value) : null;
  const [editValue, setEditValue] = useState(
    dateValue ? format(dateValue, "yyyy-MM-dd") : ""
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEditValue(e.target.value);
    if (e.target.value) {
      const newDate = new Date(e.target.value);
      if (!isNaN(newDate.getTime())) {
        onSave(newDate.getTime());
      }
    }
  }

  return (
    <Input
      type="date"
      value={editValue}
      onChange={handleChange}
      className="h-8 w-36"
      autoFocus
    />
  );
}

export function EditableTextareaCell({ value, onSave }: StringCellProps) {
  return (
    <Textarea
      defaultValue={value || ""}
      onChange={(e) => onSave(e.target.value)}
      className="min-h-20 resize-none w-full"
      autoFocus
    />
  );
}

export function EditableTextCell({ value, onSave }: StringCellProps) {
  return (
    <Input
      defaultValue={value || ""}
      onChange={(e) => onSave(e.target.value)}
      className="h-8 w-40"
      autoFocus
    />
  );
}

export function EditableProjectCell({ value, onSave }: StringCellProps) {
  return <SelectProject value={value} onValueChange={onSave} />;
}

export function EditableCategoryCell({ value, onSave }: StringCellProps) {
  return <SelectCategory value={value} onValueChange={onSave} />;
}

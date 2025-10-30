"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SelectCategory } from "../Sheets/SelectCategory";
import { SelectProject } from "../Sheets/SelectProject";

interface EditableCellProps {
  value: any;
  onSave: (value: any) => void;
  onCancel: () => void;
  isEditing: boolean;
  onEdit: () => void;
  pendingValue?: any;
  displayValue?: string;
}

export function EditableTextCell({
  value,
  onSave,
  onCancel,
  isEditing,
  onEdit,
}: EditableCellProps) {
  const [editValue, setEditValue] = useState(value || "");

  const handleSave = () => {
    if (editValue.trim()) {
      onSave(editValue.trim());
    } else {
      handleCancel();
    }
  };

  const handleCancel = () => {
    setEditValue(value || "");
    onCancel();
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-8"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
        />
        <Button size="sm" variant="ghost" onClick={handleSave}>
          <Check className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className="cursor-pointer hover:bg-muted p-1 rounded"
      onDoubleClick={onEdit}
    >
      {value || ""}
    </div>
  );
}

export function EditableAmountCell({
  value,
  onSave,
  onCancel,
  isEditing,
  onEdit,
  pendingValue,
}: EditableCellProps) {
  const currentValue = pendingValue !== undefined ? pendingValue : value;
  const [editValue, setEditValue] = useState(
    Math.abs(currentValue || 0).toString()
  );

  useEffect(() => {
    setEditValue(Math.abs(currentValue || 0).toString());
  }, [currentValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setEditValue(inputValue);
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue)) {
      const keepSign = value < 0 ? -Math.abs(numValue) : Math.abs(numValue);
      onSave(keepSign);
    }
  };

  const handleEscape = () => {
    setEditValue(Math.abs(value || 0).toString());
    onCancel();
  };

  const formatAmount = (amount: number) => {
    const formatted = new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(Math.abs(amount || 0));
    return amount < 0 ? `- ${formatted}` : `+ ${formatted}`;
  };

  if (isEditing) {
    return (
      <Input
        type="number"
        value={editValue}
        onChange={handleChange}
        className="h-8 w-24 text-right"
        autoFocus
        step="0.01"
        onKeyDown={(e) => {
          if (e.key === "Escape") handleEscape();
        }}
      />
    );
  }

  return (
    <div
      className="cursor-pointer hover:bg-muted p-1 rounded text-right font-medium"
      onDoubleClick={onEdit}
    >
      {formatAmount(currentValue)}
    </div>
  );
}

export function EditableDateCell({
  value,
  onSave,
  onCancel,
  isEditing,
  onEdit,
}: EditableCellProps) {
  const dateValue = typeof value === "number" ? new Date(value) : value;
  const [editValue, setEditValue] = useState(
    dateValue ? format(dateValue, "yyyy-MM-dd") : ""
  );

  const handleSave = () => {
    const newDate = new Date(editValue);
    if (!isNaN(newDate.getTime())) {
      onSave(newDate.getTime());
    } else {
      handleCancel();
    }
  };

  const handleCancel = () => {
    setEditValue(dateValue ? format(dateValue, "yyyy-MM-dd") : "");
    onCancel();
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-8 w-36"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
        />
        <Button size="sm" variant="ghost" onClick={handleSave}>
          <Check className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="p-1">
      {dateValue ? format(dateValue, "dd.MM.yyyy") : ""}
    </div>
  );
}

export function EditableTextareaCell({
  value,
  onSave,
  onCancel,
  isEditing,
  onEdit,
  pendingValue,
}: EditableCellProps) {
  const currentValue = pendingValue !== undefined ? pendingValue : value;
  const [editValue, setEditValue] = useState(currentValue || "");

  useEffect(() => {
    setEditValue(currentValue || "");
  }, [currentValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setEditValue(newValue);
    onSave(newValue);
  };

  if (isEditing) {
    return (
      <Textarea
        value={editValue}
        onChange={handleChange}
        className="min-h-20 resize-none w-full"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setEditValue(value || "");
            onCancel();
          }
        }}
      />
    );
  }

  return (
    <div
      className="cursor-pointer hover:bg-muted p-1 rounded max-w-64 min-w-32"
      onDoubleClick={onEdit}
    >
      <div className="whitespace-pre-wrap text-muted-foreground break-words text-sm">
        {currentValue || ""}
      </div>
    </div>
  );
}

interface EditableSelectCellProps extends EditableCellProps {
  options: { value: string; label: string }[];
}

export function EditableSelectCell({
  value,
  onSave,
  onCancel,
  isEditing,
  onEdit,
  options,
}: EditableSelectCellProps) {
  const [editValue, setEditValue] = useState(value || "");

  const handleSave = () => {
    onSave(editValue);
  };

  const handleCancel = () => {
    setEditValue(value || "");
    onCancel();
  };

  const displayValue =
    options.find((opt) => opt.value === value)?.label || value || "";

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Select value={editValue} onValueChange={setEditValue}>
          <SelectTrigger className="h-8 w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" variant="ghost" onClick={handleSave}>
          <Check className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className="cursor-pointer hover:bg-muted p-1 rounded"
      onDoubleClick={onEdit}
    >
      {displayValue}
    </div>
  );
}

export function EditableProjectCell({
  value,
  onSave,
  onCancel,
  isEditing,
  onEdit,
  pendingValue,
  displayValue,
}: EditableCellProps) {
  const currentValue = pendingValue !== undefined ? pendingValue : value;
  const [editValue, setEditValue] = useState(currentValue || "");

  useEffect(() => {
    setEditValue(currentValue || "");
  }, [currentValue]);

  const handleChange = (newValue: string) => {
    setEditValue(newValue);
    onSave(newValue);
  };

  if (isEditing) {
    return (
      <div className="w-48">
        <SelectProject value={editValue} onValueChange={handleChange} />
      </div>
    );
  }

  const displayText = displayValue || pendingValue || value || "";

  return (
    <div
      className="cursor-pointer hover:bg-muted p-1 rounded"
      onDoubleClick={onEdit}
    >
      {displayText}
    </div>
  );
}

export function EditableCategoryCell({
  value,
  onSave,
  onCancel,
  isEditing,
  onEdit,
  pendingValue,
  displayValue,
}: EditableCellProps) {
  const currentValue = pendingValue !== undefined ? pendingValue : value;
  const [editValue, setEditValue] = useState(currentValue || "");

  useEffect(() => {
    setEditValue(currentValue || "");
  }, [currentValue]);

  const handleChange = (newValue: string) => {
    setEditValue(newValue);
    onSave(newValue);
  };

  if (isEditing) {
    return (
      <div className="w-64">
        <SelectCategory value={editValue} onValueChange={handleChange} />
      </div>
    );
  }

  const displayText = displayValue || pendingValue || value || "";

  return (
    <div
      className="cursor-pointer hover:bg-muted p-1 rounded"
      onDoubleClick={onEdit}
    >
      {displayText}
    </div>
  );
}

export function EditableDateCellWithCalendar({
  value,
  onSave,
  onCancel,
  isEditing,
  onEdit,
  pendingValue,
}: EditableCellProps) {
  const getDateFromValue = (val: any): Date | undefined => {
    if (val === undefined) return undefined;
    const date = typeof val === "number" ? new Date(val) : val;
    return date && !isNaN(date.getTime()) ? date : undefined;
  };

  const valueDate = getDateFromValue(value);
  const pendingDate = getDateFromValue(pendingValue);
  const displayDate = pendingDate || valueDate;

  const getTimestamp = (val: any): number | undefined => {
    if (val === undefined) return undefined;
    if (typeof val === "number") return val;
    return val?.getTime();
  };

  const valueTimestamp = getTimestamp(value);
  const pendingTimestamp = getTimestamp(pendingValue);

  const initialDate = pendingDate || valueDate;
  const [editValue, setEditValue] = useState<Date | undefined>(initialDate);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const currentTimestamp = pendingTimestamp ?? valueTimestamp;
    const currentEditTimestamp = editValue?.getTime();

    if (
      currentTimestamp !== undefined &&
      currentTimestamp !== currentEditTimestamp
    ) {
      const newDate = new Date(currentTimestamp);
      if (!isNaN(newDate.getTime())) {
        setEditValue(newDate);
      }
    }
  }, [pendingTimestamp, valueTimestamp, editValue]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setEditValue(date);
      setOpen(false);
      onSave(date.getTime());
    }
  };

  if (isEditing) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[200px] justify-start text-left font-normal"
          >
            {editValue ? format(editValue, "dd.MM.yyyy") : "Datum wählen..."}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={editValue}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  }

  const formattedDate = displayDate ? format(displayDate, "dd.MM.yyyy") : "";

  return (
    <div
      className="cursor-pointer hover:bg-muted p-1 rounded"
      onDoubleClick={onEdit}
    >
      {formattedDate}
    </div>
  );
}

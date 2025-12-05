"use client";

import { Input } from "@/components/ui/input";
import { forwardRef, useState } from "react";

interface DateInputProps {
  value: string; // ISO format: "yyyy-MM-dd" or empty
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

// Format display: DD.MM.YYYY
// Internal storage: yyyy-MM-dd (ISO)

function formatDisplayDate(iso: string): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return "";
  return `${day}.${month}.${year}`;
}

function parseToIso(display: string): string {
  // Remove all non-digits
  const digits = display.replace(/\D/g, "");
  if (digits.length < 8) return "";

  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  // Basic validation
  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);

  if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2100) {
    return "";
  }

  return `${year}-${month}-${day}`;
}

function formatAsUserTypes(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 8)}`;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onChange, placeholder = "TT.MM.JJJJ", className, id }, ref) => {
    const [displayValue, setDisplayValue] = useState(() =>
      formatDisplayDate(value),
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const formatted = formatAsUserTypes(raw);
      setDisplayValue(formatted);

      // Try to parse as ISO when we have 8 digits
      const digits = raw.replace(/\D/g, "");
      if (digits.length === 8) {
        const iso = parseToIso(raw);
        if (iso) {
          onChange(iso);
        }
      } else if (digits.length === 0) {
        onChange("");
      }
    };

    const handleBlur = () => {
      // On blur, try to parse and reformat
      const iso = parseToIso(displayValue);
      if (iso) {
        setDisplayValue(formatDisplayDate(iso));
        onChange(iso);
      } else if (displayValue && displayValue.replace(/\D/g, "").length > 0) {
        // Invalid date, reset to last valid value
        setDisplayValue(formatDisplayDate(value));
      }
    };

    return (
      <Input
        ref={ref}
        id={id}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        maxLength={10}
      />
    );
  },
);

DateInput.displayName = "DateInput";

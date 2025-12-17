"use client";

import { useEffect, useRef, useState } from "react";

import RangeCalendar from "@/components/RangeCalendar/RangeCalendar";
import { Button } from "@/components/ui/button";
import { useDateRange } from "@/lib/DateRangeContext";
import { formatDate } from "@/lib/formatters/formatDate";

export function RangeCalendarToggle() {
  const [open, setOpen] = useState(false);
  const { selectedDateRange, setSelectedDateRange } = useDateRange();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };

    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const buttonLabel = selectedDateRange
    ? `${formatDate(selectedDateRange.from)} - ${formatDate(selectedDateRange.to)}`
    : "Alle Transaktionen";

  return (
    <div ref={containerRef} className="relative z-10" data-onborda-exclude>
      <Button variant="outline" onClick={() => setOpen(!open)}>
        {buttonLabel}
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 z-10">
          <RangeCalendar
            selectedDateRange={selectedDateRange}
            onDateRangeChange={setSelectedDateRange}
          />
        </div>
      )}
    </div>
  );
}

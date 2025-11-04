"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Building2,
  Check,
  ChevronsUpDown,
  Folder,
  Laptop,
  Megaphone,
  MoreHorizontal,
  Plane,
  Search,
  Users,
  Utensils,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { MOCK_CATEGORY_GROUPS } from "../data/mockCategories";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Verpflegung: Utensils,
  "Location & Infrastruktur": Building2,
  "Honorare & Personal": Users,
  Reisekosten: Plane,
  "Marketing & Werbung": Megaphone,
  Verwaltung: Folder,
  "IT & Digitale Tools": Laptop,
  Sonstiges: MoreHorizontal,
};

export function SelectCategory({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [activeGroupIdx, setActiveGroupIdx] = useState(0);
  const [activeItemIdx, setActiveItemIdx] = useState(0);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  const selectedItem = MOCK_CATEGORY_GROUPS.flatMap((g) => g.items).find(
    (item) => item.value === value
  );

  const filteredGroups = useMemo(() => {
    if (!search) return MOCK_CATEGORY_GROUPS;
    const searchLower = search.toLowerCase();
    return MOCK_CATEGORY_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.label.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          group.group.toLowerCase().includes(searchLower)
      ),
    })).filter((group) => group.items.length > 0);
  }, [search]);

  const activeItems = filteredGroups[activeGroupIdx]?.items || [];

  useEffect(() => {
    if (search && filteredGroups.length > 0) {
      setActiveGroupIdx(0);
      setActiveItemIdx(0);
    }
  }, [search, filteredGroups.length]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      const groupIdx = MOCK_CATEGORY_GROUPS.findIndex((g) =>
        g.items.some((i) => i.value === value)
      );
      setActiveGroupIdx(groupIdx >= 0 ? groupIdx : 0);
      if (groupIdx >= 0) {
        const itemIdx = MOCK_CATEGORY_GROUPS[groupIdx].items.findIndex(
          (i) => i.value === value
        );
        setActiveItemIdx(itemIdx >= 0 ? itemIdx : 0);
      } else {
        setActiveItemIdx(0);
      }
    } else if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, value]);

  useEffect(() => {
    const element = itemRefs.current.get(activeItemIdx);
    element?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeItemIdx]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveItemIdx((prev) =>
          prev < activeItems.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveItemIdx((prev) =>
          prev > 0 ? prev - 1 : activeItems.length - 1
        );
        break;
      case "ArrowRight":
        e.preventDefault();
        setActiveGroupIdx((prev) =>
          prev < filteredGroups.length - 1 ? prev + 1 : 0
        );
        setActiveItemIdx(0);
        break;
      case "ArrowLeft":
        e.preventDefault();
        setActiveGroupIdx((prev) =>
          prev > 0 ? prev - 1 : filteredGroups.length - 1
        );
        setActiveItemIdx(0);
        break;
      case "Enter":
        e.preventDefault();
        if (activeItems[activeItemIdx]) {
          onValueChange(activeItems[activeItemIdx].value);
          setOpen(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-auto py-2.5 hover:bg-accent/50 transition-all"
        >
          <span className="flex flex-col items-start gap-1 flex-1 min-w-0">
            <span
              className={cn(
                "font-medium text-sm",
                value ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {value ? selectedItem?.label : "Kategorie wählen..."}
            </span>
            {selectedItem?.description && (
              <span className="text-xs text-muted-foreground line-clamp-1 text-left">
                {selectedItem.description}
              </span>
            )}
          </span>
          <ChevronsUpDown className="opacity-50 shrink-0 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 shadow-xl border w-[640px] z-[100]"
        align="start"
        side="bottom"
        sideOffset={4}
        onKeyDown={handleKeyDown}
      >
        <div className="border-b ">
          <div className="flex items-center gap-2 w-full h-9 rounded-md  border-input bg-background px-3 text-sm transition-all ">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              ref={inputRef}
              placeholder="Kategorie suchen..."
              className="h-5 border-0 p-0 focus-visible:ring-0 font-medium placeholder:text-muted-foreground text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {search && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSearch("");
                  inputRef.current?.focus();
                }}
                className="shrink-0 rounded-sm opacity-50 hover:opacity-100 transition-opacity"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex max-h-[440px]">
          {filteredGroups.length === 0 ? (
            <div className="flex-1 py-12 text-center">
              <div className="flex flex-col items-center gap-2">
                <Search className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm font-medium text-foreground">
                  Keine Kategorie gefunden
                </p>
                <p className="text-xs text-muted-foreground">
                  Versuchen Sie einen anderen Suchbegriff
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-64 border-r bg-muted/30 overflow-y-auto">
                {filteredGroups.map((group, idx) => {
                  const Icon = CATEGORY_ICONS[group.group] || MoreHorizontal;
                  return (
                    <button
                      key={group.group}
                      className={cn(
                        "w-full text-left px-4 py-3 text-sm font-semibold hover:bg-accent/50 transition-colors flex items-center gap-3 group",
                        idx === activeGroupIdx && "bg-accent"
                      )}
                      onMouseEnter={() => {
                        setActiveGroupIdx(idx);
                        setActiveItemIdx(0);
                      }}
                      type="button"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                      <span className="flex-1">
                        {idx + 1}. {group.group}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="flex-1 overflow-y-auto ">
                {activeItems.map((item, itemIdx) => (
                  <button
                    key={item.value}
                    ref={(el) => {
                      if (el) itemRefs.current.set(itemIdx, el);
                      else itemRefs.current.delete(itemIdx);
                    }}
                    className={cn(
                      "w-full text-left px-2 py-1  hover:bg-accent transition-all group",
                      itemIdx === activeItemIdx && "bg-accent",
                      value === item.value && "bg-accent/50"
                    )}
                    onClick={() => {
                      onValueChange(item.value);
                      setOpen(false);
                    }}
                    onMouseEnter={() => setActiveItemIdx(itemIdx)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium leading-snug mb-1 flex items-center gap-2">
                          {item.label}
                          {value === item.value && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-muted text-[10px] font-semibold text-muted-foreground">
                              Ausgewählt
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          {item.description}
                        </div>
                      </div>
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0 mt-0.5 transition-all",
                          value === item.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

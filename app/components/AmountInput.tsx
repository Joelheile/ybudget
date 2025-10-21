"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "./ui/input-group";

const sanitizeAmount = (value: string) => value.replace(/[^\d,]/g, "");

export function AmountInput({
  value,
  onChange,
  autoFocus = false,
  id = "amount",
}: {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  id?: string;
}) {
  return (
    <InputGroup>
      <InputGroupAddon>
        <InputGroupText className="text-muted-foreground">€</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        className="font-medium  placeholder:text-muted-foreground"
        type="text"
        inputMode="decimal"
        placeholder="0,00"
        value={value}
        onChange={(e) => onChange(sanitizeAmount(e.target.value))}
        autoFocus={autoFocus}
        data-has-value={value ? "true" : undefined}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupText className="">EUR</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  );
}

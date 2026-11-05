// src/components/ui/MaskedDateInput.tsx
"use client";

import { Input } from "@/components/ui/input";
import React from "react";

interface MaskedDateInputProps {
  value: string; // Expected format: YYYY-MM-DD (from DB) or empty
  onChange: (isoDate: string) => void;
  id?: string;
}

export function MaskedDateInput({ value, onChange, id }: MaskedDateInputProps) {
  // Convert DB format (YYYY-MM-DD) to display format (DD/MM/YYYY)
  const formatForDisplay = (val: string) => {
    if (!val) return "";
    const parts = val.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return val;
  };

  const [displayValue, setDisplayValue] = React.useState(formatForDisplay(value));

  // Sync if parent value changes externally (e.g., opening edit modal)
  React.useEffect(() => {
    setDisplayValue(formatForDisplay(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, ""); // Remove all non-digits
    
    // Limit to 8 digits (DDMMYYYY)
    if (input.length > 8) input = input.slice(0, 8);

    // Auto-insert slashes
    let formatted = "";
    if (input.length > 0) {
      formatted += input.slice(0, 2);
    }
    if (input.length > 2) {
      formatted += "/" + input.slice(2, 4);
    }
    if (input.length > 4) {
      formatted += "/" + input.slice(4, 8);
    }

    setDisplayValue(formatted);

    // Send YYYY-MM-DD back to parent (if fully valid)
    if (input.length === 8) {
      const day = input.slice(0, 2);
      const month = input.slice(2, 4);
      const year = input.slice(4, 8);
      
      // Basic validation (e.g., month cannot be 13, day cannot be 32)
      const isMonthValid = parseInt(month, 10) >= 1 && parseInt(month, 10) <= 12;
      const isDayValid = parseInt(day, 10) >= 1 && parseInt(day, 10) <= 31;
      const isYearValid = parseInt(year, 10) >= 1900 && parseInt(year, 10) <= new Date().getFullYear();

      if (isMonthValid && isDayValid && isYearValid) {
        onChange(`${year}-${month}-${day}`);
      } else {
        onChange(""); // Invalid date
      }
    } else {
      onChange(""); // Incomplete date
    }
  };

  return (
    <Input
      id={id}
      type="text"
      inputMode="numeric"
      placeholder="DD/MM/YYYY"
      value={displayValue}
      onChange={handleChange}
      maxLength={10}
    />
  );
}

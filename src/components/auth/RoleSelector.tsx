// components/auth/RoleSelector.tsx
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserRole } from "@/types";
import { ROLE_LABELS } from "@/config/roles";

interface RoleSelectorProps {
  value: UserRole | "";
  onChange: (role: UserRole) => void;
  disabled?: boolean;
}

export function RoleSelector({ value, onChange, disabled }: RoleSelectorProps) {
  return (
    <Select
      value={value}
      onValueChange={(val) => onChange(val as UserRole)}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select your role" />
      </SelectTrigger>
      <SelectContent>
        {(Object.entries(ROLE_LABELS) as [UserRole, string][])
          .filter(([key]) => key !== "super_admin")
          .map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}

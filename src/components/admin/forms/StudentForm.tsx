// src/components/admin/forms/StudentForm.tsx
"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MaskedDateInput } from "@/components/ui/MaskedDateInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Lock } from "lucide-react";

export interface StudentFormSubscriptionError {
  code?: string; // "STUDENT_CAP_REACHED" | "SUBSCRIPTION_INACTIVE"
  tier?: string;
  cap?: number;
  current?: number;
  message: string;
}

interface StudentFormProps {
  data?: Record<string, any>;
  onChange: (field: string, value: any) => void;
  classes?: { id: string; name: string }[];
  /** If present, a banner is rendered at the top of the form and fields are disabled. */
  subscriptionError?: StudentFormSubscriptionError | null;
}

export function StudentForm({
  data = {},
  onChange,
  classes = [],
  subscriptionError = null,
}: StudentFormProps) {
  const isLocked = !!subscriptionError;

  const calculateAge = (dob: string) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  };

  const age = calculateAge(data.date_of_birth);

  // Field-level onChange wrapper — no-ops when the form is locked,
  // so a user can't bypass the gate by typing into a disabled field.
  const set = (field: string, value: any) => {
    if (isLocked) return;
    onChange(field, value);
  };

  return (
    <div className="space-y-4">
      {subscriptionError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <div className="flex items-start gap-2">
            {subscriptionError.code === "SUBSCRIPTION_INACTIVE" ? (
              <Lock className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-medium">{subscriptionError.message}</p>
              {subscriptionError.code === "STUDENT_CAP_REACHED" &&
                subscriptionError.cap !== undefined &&
                subscriptionError.current !== undefined && (
                  <p className="mt-1 text-xs text-red-700">
                    Currently using {subscriptionError.current} of{" "}
                    {subscriptionError.cap} students on the{" "}
                    <span className="capitalize">
                      {subscriptionError.tier}
                    </span>{" "}
                    plan.
                  </p>
                )}
              <Link
                href="/dashboard/admin/billing"
                className="mt-2 inline-block text-sm font-medium text-red-900 underline hover:no-underline"
              >
                {subscriptionError.code === "SUBSCRIPTION_INACTIVE"
                  ? "Renew subscription"
                  : "Upgrade plan"}{" "}
                →
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name *</Label>
        <Input
          id="full_name"
          value={data.full_name || ""}
          onChange={(e) => set("full_name", e.target.value)}
          placeholder="Enter student's full name"
          disabled={isLocked}
        />
      </div>

      <div className="space-y-2">
        <Label>Admission Number</Label>
        <div className="px-3 py-2 text-sm text-gray-500 bg-gray-50 border rounded-md">
          Auto-generated when saved (e.g. RFA/2026/10A001)
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date_of_birth">
            Date of Birth{" "}
            {age !== null && (
              <span className="text-green-600 font-medium">({age} yrs)</span>
            )}
          </Label>
          <MaskedDateInput
            id="date_of_birth"
            value={data.date_of_birth || ""}
            onChange={(isoDate) => set("date_of_birth", isoDate)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={data.gender || ""}
            onValueChange={(value) => set("gender", value)}
            disabled={isLocked}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="guardian_name">Guardian Name *</Label>
        <Input
          id="guardian_name"
          value={data.guardian_name || ""}
          onChange={(e) => set("guardian_name", e.target.value)}
          placeholder="Enter guardian's full name"
          disabled={isLocked}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="guardian_phone">Guardian Phone *</Label>
          <Input
            id="guardian_phone"
            value={data.guardian_phone || ""}
            onChange={(e) => set("guardian_phone", e.target.value)}
            placeholder="Phone number"
            disabled={isLocked}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="guardian_email">Guardian Email</Label>
          <Input
            id="guardian_email"
            type="email"
            value={data.guardian_email || ""}
            onChange={(e) => set("guardian_email", e.target.value)}
            placeholder="Email address"
            disabled={isLocked}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={data.address || ""}
          onChange={(e) => set("address", e.target.value)}
          placeholder="Enter address"
          disabled={isLocked}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="enrollment_year">Enrollment Year *</Label>
          <Input
            id="enrollment_year"
            type="number"
            value={data.enrollment_year || ""}
            onChange={(e) => {
              const value = e.target.value === "" ? "" : parseInt(e.target.value);
              set("enrollment_year", value);
            }}
            placeholder={new Date().getFullYear().toString()}
            disabled={isLocked}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="class_id">Class</Label>
          <Select
            value={data.class_id || "none"}
            onValueChange={(value) =>
              set("class_id", value === "none" ? null : value)
            }
            disabled={isLocked}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No class</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

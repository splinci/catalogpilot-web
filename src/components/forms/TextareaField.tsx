"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TextareaFieldProps {
  id: string;
  label: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  onChange: (value: string) => void;
}

export function TextareaField({
  id,
  label,
  value = "",
  placeholder,
  required = false,
  disabled = false,
  rows = 4,
  onChange,
}: TextareaFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </Label>

      <Textarea
        id={id}
        rows={rows}
        value={value ?? ""}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />
    </div>
  );
}
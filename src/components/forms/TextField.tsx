"use client";

import Input from "@/components/ui/Input";
import { Label } from "@/components/ui/label";

interface TextFieldProps {
  id: string;
  label: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function TextField({
  id,
  label,
  value = "",
  placeholder,
  required = false,
  disabled = false,
  onChange,
}: TextFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </Label>

      <Input
        id={id}
        value={value ?? ""}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
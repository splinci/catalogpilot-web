"use client";

import Input from "@/components/ui/Input";
import { Label } from "@/components/ui/label";

interface NumberFieldProps {
  id: string;
  label: string;
  value: number;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  min?: number;
  step?: number;
  onChange: (value: number) => void;
}

export function NumberField({
  id,
  label,
  value,
  placeholder,
  required = false,
  disabled = false,
  min,
  step,
  onChange,
}: NumberFieldProps) {
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
        type="number"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        step={step}
        onChange={(e) =>
          onChange(Number(e.target.value))
        }
      />
    </div>
  );
}
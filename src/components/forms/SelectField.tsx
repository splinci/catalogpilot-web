"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function SelectField({
  id,
  label,
  value,
  options,
  placeholder = "Select...",
  required = false,
  disabled = false,
  onChange,
}: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </Label>

      <Select
  value={value}
  onValueChange={(value) => {
    if (value !== null) {
      onChange(value);
    }
  }}
  disabled={disabled}
>
        <SelectTrigger id={id} className="w-full">
        <SelectValue>
  {options.find((option) => option.value === value)?.label ??
    placeholder}
</SelectValue>
        </SelectTrigger>

        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
"use client";

import Input from "@/components/ui/Input";

interface SupplierSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function SupplierSearch({
  value,
  onChange,
}: SupplierSearchProps) {
  return (
    <Input
      placeholder="Search suppliers..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
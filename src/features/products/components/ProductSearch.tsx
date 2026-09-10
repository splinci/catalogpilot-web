"use client";

import Input from "@/components/ui/Input";

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProductSearch({
  value,
  onChange,
}: ProductSearchProps) {
  return (
    <Input
      placeholder="Search products..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
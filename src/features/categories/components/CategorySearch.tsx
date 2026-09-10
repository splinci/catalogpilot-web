"use client";

import Input from "@/components/ui/Input";

interface CategorySearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategorySearch({
  value,
  onChange,
}: CategorySearchProps) {
  return (
    <Input
      placeholder="Search categories..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
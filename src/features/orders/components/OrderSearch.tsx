"use client";

import Input from "@/components/ui/Input";

interface OrderSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function OrderSearch({
  value,
  onChange,
}: OrderSearchProps) {
  return (
    <Input
      placeholder="Search orders..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
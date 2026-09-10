"use client";

import Input from "@/components/ui/Input";
import { Label } from "@/components/ui/label";

type BrandSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function BrandSearch({
  value,
  onChange,
}: BrandSearchProps) {
  return (
    <div className="max-w-md">
      <Label htmlFor="brand-search">
        Search Brands
      </Label>

      <Input
        id="brand-search"
        placeholder="Search by Code, Brand or Description..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
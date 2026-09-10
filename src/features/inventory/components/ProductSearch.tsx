"use client";

import Input from "@/components/ui/Input";
import { Label } from "@/components/ui/label";

type ProductSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ProductSearch({
  value,
  onChange,
}: ProductSearchProps) {
  return (
    <div className="mb-6">
      <Label htmlFor="product-search">
        Search Products
      </Label>

      <Input
        id="product-search"
        placeholder="Search by SKU, Product or Brand..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
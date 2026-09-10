"use client";

import { Search } from "lucide-react";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

import { useProductSearch } from "@/domains/product/hooks/useProductSearch";
import type { Product } from "@/domains/product/types/product";

import { ProductSearchResult } from "./ProductSearchResult";

interface ProductSectionProps {
  search: string;
  onSearchChange: (value: string) => void;
  onProductSelect: (product: Product) => void;
}

export function ProductSection({
  search,
  onSearchChange,
  onProductSelect,
}: ProductSectionProps) {
  const { products, loading } = useProductSearch(search);

  const handleSelectProduct = (product: Product) => {
    onProductSelect(product);
    onSearchChange("");
  };

  return (
    <Card title="Products">
      <div className="space-y-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <Input
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />

          {search.trim().length >= 2 && (
            <div className="absolute left-0 right-0 z-20 mt-2 max-h-80 overflow-y-auto rounded-xl border bg-white shadow-xl">
              {loading ? (
                <div className="p-5 text-sm text-slate-500">
                  Searching products...
                </div>
              ) : products.length === 0 ? (
                <div className="p-5 text-sm text-slate-500">
                  No matching products found.
                </div>
              ) : (
                <div className="divide-y">
                  {products.map((product) => (
                    <ProductSearchResult
                      key={product.id}
                      product={product}
                      onSelect={handleSelectProduct}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-dashed bg-slate-50 p-8 text-center">
          <p className="font-medium">
            No products added
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Search and select products to build this order.
          </p>
        </div>
      </div>
    </Card>
  );
}
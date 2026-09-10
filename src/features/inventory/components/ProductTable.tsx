"use client";

import { useMemo, useState } from "react";
import { Archive, SquarePen, PackagePlus } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/domains/product/types/product";
import { ProductSearch } from "./ProductSearch";
import { AdjustStockDialog } from "./AdjustStockDialog";

interface ProductTableProps {
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onArchiveProduct: (product: Product) => void;
}

export function ProductTable({
  onAddProduct,
  onEditProduct,
  onArchiveProduct,
}: ProductTableProps) {
  const { products, loading, error } = useProducts();
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    const keyword = search.toLowerCase();

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(keyword) ||
        product.sku.toLowerCase().includes(keyword) ||
        (product.brand?.name ?? "").toLowerCase().includes(keyword)
      );
    });
  }, [products, search]);

  function handleAdjustStock(product: Product) {
    setSelectedProduct(product);
    setAdjustDialogOpen(true);
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
        <LoadingSpinner message="Loading inventory products..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 font-semibold shadow-xs">
        ⚠️ Failed to load inventory products.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      {/* Search Bar Toolbar */}
      <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50/80">
        <div className="max-w-md">
          <ProductSearch value={search} onChange={setSearch} />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <EmptyState
          title="No Products Found"
          description="Create your first inventory product."
          action={
            <button
              onClick={onAddProduct}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors"
            >
              + Add Product
            </button>
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
              <tr>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-right">Stock</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 shadow-2xs">
                      {product.sku}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {product.name}
                    </div>

                    <div className="mt-0.5 text-xs text-slate-500">
                      {product.brand?.name ?? "No Brand"}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right font-black text-slate-900">
                    ${product.sellingPrice.toFixed(2)}
                  </td>

                  <td className="px-6 py-4 text-right font-extrabold text-indigo-700">
                    {product.currentStock} units
                  </td>

                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={product.status} />
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onEditProduct(product)}
                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-2xs"
                        title="Edit Product"
                      >
                        <SquarePen className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleAdjustStock(product)}
                        className="rounded-lg border border-indigo-200 bg-indigo-50 p-2 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all shadow-2xs"
                        title="Adjust Stock"
                      >
                        <PackagePlus className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => onArchiveProduct(product)}
                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all shadow-2xs"
                        title="Archive Product"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdjustStockDialog
        open={adjustDialogOpen}
        onOpenChange={setAdjustDialogOpen}
        product={
          selectedProduct && {
            id: selectedProduct.id,
            sku: selectedProduct.sku,
            name: selectedProduct.name,
            currentStock: selectedProduct.currentStock,
          }
        }
      />
    </div>
  );
}
"use client";

import { useMemo, useState } from "react";
import { Archive, SquarePen, Search, AlertTriangle, CheckCircle2, Package, Tag, Filter, Layers } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { StatusBadge } from "@/components/common/StatusBadge";

import type { Product } from "@/domains/product/types/product";

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  error: string | null;

  onEditProduct: (product: Product) => void;
  onArchiveProduct: (product: Product) => void;
}

export function ProductTable({
  products,
  loading,
  error,
  onEditProduct,
  onArchiveProduct,
}: ProductTableProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const categoriesList = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category?.name) cats.add(p.category.name);
    });
    return Array.from(cats);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const keyword = search.toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(keyword) ||
        product.sku.toLowerCase().includes(keyword);

      const matchesCategory =
        selectedCategory === "ALL" || product.category?.name === selectedCategory;

      const matchesStatus =
        selectedStatus === "ALL" || product.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, selectedCategory, selectedStatus]);

  const getStockBadge = (current: number, min: number) => {
    if (current === 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 border border-red-200 shadow-2xs">
          <AlertTriangle className="h-3 w-3 text-red-600 animate-pulse" /> Out of Stock (0)
        </span>
      );
    }
    if (current <= min) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200 shadow-2xs">
          <AlertTriangle className="h-3 w-3 text-amber-600" /> Low Stock ({current})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 shadow-2xs">
        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> {current} in stock
      </span>
    );
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
        <LoadingSpinner message="Loading product catalog..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 shadow-xs font-semibold">
        ⚠️ Failed to load products. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50/80">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by SKU or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-hidden shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
            <Filter className="h-3.5 w-3.5 text-indigo-600" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
            <Layers className="h-3.5 w-3.5 text-purple-600" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Archived Only</option>
            </select>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center">
          <Package className="mx-auto h-10 w-10 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Products Found</h3>
          <p className="text-sm text-slate-500 mt-1">No products match your search query or filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
              <tr>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Brand</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4 text-center">Stock Level</th>
                <th className="px-6 py-4 text-right">Price</th>
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

                  <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {product.name}
                  </td>

                  <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                    {product.brand?.name ? (
                      <span className="inline-block bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                        {product.brand.name}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                    {product.category?.name ? (
                      <span className="inline-block bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">
                        {product.category.name}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="px-6 py-4 text-xs font-medium text-slate-600">
                    {product.supplier?.name ?? "-"}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {getStockBadge(product.currentStock, product.minimumStock)}
                  </td>

                  <td className="px-6 py-4 text-right font-black text-slate-900 text-base">
                    ${Number(product.sellingPrice).toFixed(2)}
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
    </div>
  );
}
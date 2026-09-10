"use client";

import { useState } from "react";

import { ProductHeader } from "@/features/products/components/ProductHeader";
import { ProductStats } from "@/features/products/components/ProductStats";
import { ProductTable } from "@/features/products/components/ProductTable";
import { ProductDialog } from "@/features/products/components/ProductDialog";
import { ArchiveProductDialog } from "@/features/products/components/ArchiveProductDialog";

import { useProducts } from "@/hooks/useProducts";

import type { Product } from "@/domains/product/types/product";

export default function ProductsPage() {
  const {
    products,
    loading,
    error,
  } = useProducts();

  const [selectedProduct, setSelectedProduct] =
    useState<Product | undefined>(undefined);

  const [productDialogOpen, setProductDialogOpen] =
    useState(false);

  const [archiveDialogOpen, setArchiveDialogOpen] =
    useState(false);

    function handleEdit(product: Product) {
      setSelectedProduct(product);
      setProductDialogOpen(true);
    }
    
    function handleArchive(product: Product) {
      setSelectedProduct(product);
      setArchiveDialogOpen(true);
    }

  return (
    
    <main className="container mx-auto space-y-6 py-8">
      <ProductHeader />

      <ProductStats
        products={products}
      />

      <ProductTable
        products={products}
        loading={loading}
        error={error}
        onEditProduct={handleEdit}
        onArchiveProduct={handleArchive}
      />

      <ProductDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        product={selectedProduct}
      />

      <ArchiveProductDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        product={selectedProduct}
      />
    </main>
  );
}
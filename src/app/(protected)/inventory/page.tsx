"use client";

import { useState } from "react";

import { InventoryHeader } from "@/features/inventory/components/InventoryHeader";
import { InventoryStats } from "@/features/inventory/components/InventoryStats";
import { ProductDialog } from "@/features/inventory/components/ProductDialog";
import { ProductTable } from "@/features/inventory/components/ProductTable";

import type { Product } from "@/domains/product/types/product";
import { ArchiveProductDialog } from "@/features/inventory/components/ArchiveProductDialog";

import { InventoryTabs } from "@/features/inventory/components/InventoryTabs";

import InventoryHistoryTable from "@/features/inventory-history/components/InventoryHistoryTable";

export default function InventoryPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<Product>();
  
    const [archiveOpen, setArchiveOpen] =
    useState(false);

  const [activeTab, setActiveTab] = useState<
    "products" | "history"
  >("products");

  function handleAddProduct() {
    setSelectedProduct(undefined);
    setDialogOpen(true);
  }

  function handleEditProduct(
    product: Product
  ) {
    setSelectedProduct(product);
    setDialogOpen(true);
  }
  function handleArchiveProduct(
    product: Product
  ) {
    setSelectedProduct(product);
    setArchiveOpen(true);
  }
  return (
    <div>

    <InventoryHeader
        onAddProduct={handleAddProduct}
        showAddButton={activeTab === "products"}
      />

      <InventoryStats />

      <InventoryTabs
  activeTab={activeTab}
  onChange={setActiveTab}
/>

      {activeTab === "products" ? (
  <ProductTable
    onAddProduct={handleAddProduct}
    onEditProduct={handleEditProduct}
    onArchiveProduct={handleArchiveProduct}
  />
) : (
  <InventoryHistoryTable />
)}

      <ProductDialog
        open={dialogOpen}
        product={selectedProduct}
        onOpenChange={(open) => {
          setDialogOpen(open);

          if (!open) {
            setSelectedProduct(undefined);
          }
        }}
      />
      <ArchiveProductDialog
  open={archiveOpen}
  product={selectedProduct}
  onOpenChange={(open) => {
    setArchiveOpen(open);

    if (!open) {
      setSelectedProduct(undefined);
    }
  }}
/>
</div>
  );
}
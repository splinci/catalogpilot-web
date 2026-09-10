"use client";

import { Plus, Boxes } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";

interface InventoryHeaderProps {
  onAddProduct: () => void;
  showAddButton?: boolean;
}

export function InventoryHeader({
  onAddProduct,
  showAddButton = true,
}: InventoryHeaderProps) {
  return (
    <div className="mb-6">
      <PageHero
        title="Stock & Inventory Control"
        description="Monitor real-time warehouse stock levels, safety thresholds, and inventory audit logs."
        actions={
          showAddButton && (
            <button
              onClick={onAddProduct}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add Product</span>
            </button>
          )
        }
      />
    </div>
  );
}
"use client";

import { Plus, Truck } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";

interface SupplierHeaderProps {
  onAddSupplier: () => void;
}

export function SupplierHeader({
  onAddSupplier,
}: SupplierHeaderProps) {
  return (
    <div className="mb-6">
      <PageHero
        title="Supplier Vendor Directory"
        description="Manage vendor profiles, contact details, payment terms, and purchase lead times."
        actions={
          <button
            onClick={onAddSupplier}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Supplier</span>
          </button>
        }
      />
    </div>
  );
}
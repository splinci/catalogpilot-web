"use client";

interface InventoryTabsProps {
  activeTab: "products" | "history";
  onChange: (
    tab: "products" | "history"
  ) => void;
}

export function InventoryTabs({
  activeTab,
  onChange,
}: InventoryTabsProps) {
  return (
    <div className="mb-6 border-b border-slate-200">
      <div className="flex gap-6">
        <button
          onClick={() => onChange("products")}
          className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "products"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Products
        </button>

        <button
          onClick={() => onChange("history")}
          className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "history"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          History
        </button>
      </div>
    </div>
  );
}
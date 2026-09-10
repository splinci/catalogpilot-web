import InventoryHistoryTable from "@/features/inventory-history/components/InventoryHistoryTable";

export default function InventoryHistoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        Inventory History
      </h1>

      <InventoryHistoryTable />
    </div>
  );
}
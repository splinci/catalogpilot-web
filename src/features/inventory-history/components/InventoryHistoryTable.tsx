"use client";

import { useMemo, useState } from "react";

import Card from "@/components/ui/Card";
import { DataTable } from "@/components/data-table/DataTable";

import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

import { SearchField } from "@/components/forms/SearchField";

import TransactionTypeBadge from "./TransactionTypeBadge";

import { useInventoryHistory } from "@/hooks/useInventoryHistory";

import type { InventoryHistoryItem } from "@/features/inventory-history/types/inventory-history";

export default function InventoryHistoryTable() {
  const {
    transactions,
    loading,
    error,
  } = useInventoryHistory();

  const [search, setSearch] = useState("");

  const filteredTransactions = useMemo(() => {
    const keyword = search.toLowerCase();

    return transactions.filter(
      (transaction: InventoryHistoryItem) =>
        transaction.product.name
          .toLowerCase()
          .includes(keyword) ||
        transaction.product.sku
          .toLowerCase()
          .includes(keyword)
    );
  }, [transactions, search]);

  if (loading) {
    return (
      <Card title="Inventory History">
        <LoadingSpinner message="Loading inventory history..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Inventory History">
        <p className="text-red-600">
          Failed to load inventory history.
        </p>
      </Card>
    );
  }

  return (
    <Card title="Inventory History">
      <div className="mb-6 max-w-md">
        <SearchField
          label="Search History"
          placeholder="Search by Product or SKU..."
          value={search}
          onChange={setSearch}
        />
      </div>

      {filteredTransactions.length === 0 ? (
        <EmptyState
          title="No Inventory History"
          description="No inventory transactions match your search."
        />
      ) : (
        <DataTable>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100">
              <th className="px-4 py-4 text-left text-sm font-semibold">
                Date
              </th>

              <th className="px-4 py-4 text-left text-sm font-semibold">
                Product
              </th>

              <th className="px-4 py-4 text-left text-sm font-semibold">
                SKU
              </th>

              <th className="px-4 py-4 text-left text-sm font-semibold">
                Type
              </th>

              <th className="px-4 py-4 text-right text-sm font-semibold">
                Qty
              </th>

              <th className="px-4 py-4 text-right text-sm font-semibold">
                Before
              </th>

              <th className="px-4 py-4 text-right text-sm font-semibold">
                After
              </th>

              <th className="px-4 py-4 text-left text-sm font-semibold">
                Reference
              </th>

              <th className="px-4 py-4 text-left text-sm font-semibold">
                Remarks
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredTransactions.map(
              (transaction: InventoryHistoryItem) => (
                <tr
                  key={transaction.id}
                  className="border-b border-slate-200 transition-colors hover:bg-slate-50"
                >
                  <td className="px-4 py-5 whitespace-nowrap">
                    {new Intl.DateTimeFormat("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(
                      new Date(transaction.createdAt)
                    )}
                  </td>

                  <td className="px-4 py-5">
                    <div className="font-semibold">
                      {transaction.product.name}
                    </div>

                    <div className="mt-1 text-sm text-slate-500">
                      {transaction.product.sku}
                    </div>
                  </td>

                  <td className="px-4 py-5">
                    {transaction.product.sku}
                  </td>

                  <td className="px-4 py-5">
                    <TransactionTypeBadge
                      type={transaction.type}
                    />
                  </td>

                  <td className="px-4 py-5 text-right font-semibold">
                    {transaction.quantity}
                  </td>

                  <td className="px-4 py-5 text-right">
                    {transaction.beforeStock}
                  </td>

                  <td className="px-4 py-5 text-right">
                    {transaction.afterStock}
                  </td>

                  <td className="px-4 py-5">
                    {transaction.reference || "—"}
                  </td>

                  <td className="px-4 py-5">
                    {transaction.remarks || "—"}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </DataTable>
      )}
    </Card>
  );
}
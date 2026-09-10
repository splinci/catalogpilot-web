"use client";

import { Minus, Plus, Trash2, Package } from "lucide-react";

import { Button } from "@/components/ui/Button";

import type { OrderItem } from "./types";

interface OrderItemsTableProps {
  items: OrderItem[];
  onQuantityChange: (
    productId: string,
    quantity: number
  ) => void;
  onRemove: (productId: string) => void;
}

export function OrderItemsTable({
  items,
  onQuantityChange,
  onRemove,
}: OrderItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-slate-50 p-10 text-center">
        <Package className="mx-auto mb-3 h-10 w-10 text-slate-400" />

        <h3 className="font-semibold">
          No Products Added
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Search and add products to start building this order.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr className="border-b">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Product
              </th>

              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                Quantity
              </th>

              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Unit Price
              </th>

              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total
              </th>

              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr
                key={item.product.id}
                className="border-b transition-colors hover:bg-slate-50"
              >
                <td className="px-6 py-4">
                  <div className="font-medium">
                    {item.product.name}
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    SKU: {item.product.sku}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        onQuantityChange(
                          item.product.id,
                          Math.max(1, item.quantity - 1)
                        )
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>

                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        onQuantityChange(
                          item.product.id,
                          Number(e.target.value)
                        )
                      }
                      className="w-16 rounded-lg border px-2 py-2 text-center"
                    />

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        onQuantityChange(
                          item.product.id,
                          item.quantity + 1
                        )
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </td>

                <td className="px-6 py-4 text-right">
                  ₹{Number(item.unitPrice).toFixed(2)}
                </td>

                <td className="px-6 py-4 text-right font-semibold">
                  ₹{(
                    item.quantity *
                    Number(item.unitPrice)
                  ).toFixed(2)}
                </td>

                <td className="px-6 py-4 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      onRemove(item.product.id)
                    }
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
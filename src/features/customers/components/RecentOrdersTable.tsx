"use client";

import Link from "next/link";
import { Eye } from "lucide-react";

import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/data-table/DataTable";
import { EmptyState } from "@/components/common/EmptyState";

import { OrderStatusBadge } from "@/domains/order/components/OrderStatusBadge";
import { PaymentStatusBadge } from "@/domains/order/components/PaymentStatusBadge";

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string | Date;
}

interface RecentOrdersTableProps {
  orders: RecentOrder[];
}

export function RecentOrdersTable({
  orders,
}: RecentOrdersTableProps) {
  if (orders.length === 0) {
    return (
      <Card title="Recent Orders">
        <EmptyState
          title="No Orders Found"
          description="This customer has not placed any orders yet."
        />
      </Card>
    );
  }

  return (
    <Card title="Recent Orders">
      <div className="overflow-x-auto">
        <DataTable>
          <thead className="bg-slate-50">
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Order #
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Payment
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
              </th>

              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b transition-colors hover:bg-slate-50"
              >
                <td className="px-4 py-4 font-semibold">
                  {order.orderNumber}
                </td>

                <td className="px-4 py-4">
                  <OrderStatusBadge
                    status={order.status as any}
                  />
                </td>

                <td className="px-4 py-4">
                  <PaymentStatusBadge
                    status={order.paymentStatus as any}
                  />
                </td>

                <td className="px-4 py-4 text-right font-semibold">
                  ₹
                  {Number(order.total).toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                    }
                  )}
                </td>

                <td className="px-4 py-4 text-slate-600">
                  {new Intl.DateTimeFormat("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }).format(
                    new Date(order.createdAt)
                  )}
                </td>

                <td className="px-4 py-4 text-center">
                  <Link href={`/orders/${order.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </div>
    </Card>
  );
}
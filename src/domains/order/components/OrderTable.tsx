"use client";

import Link from "next/link";
import { Eye, ShoppingCart } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import type { OrderSummary } from "@/domains/order/types/order";

interface OrderTableProps {
  orders: OrderSummary[];
  loading: boolean;
  error: string | null;
}

export function OrderTable({
  orders,
  loading,
  error,
}: OrderTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
        <LoadingSpinner message="Loading sales orders..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 font-semibold shadow-xs">
        ⚠️ {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-12 shadow-xs">
        <EmptyState
          title="No Orders Found"
          description="Create your first customer order to start tracking sales."
          action={
            <Link href="/orders/new">
              <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors">
                + New Order
              </button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
            <tr>
              <th className="px-6 py-4">Order #</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Payment</th>
              <th className="px-6 py-4 text-right">Items</th>
              <th className="px-6 py-4 text-right">Total</th>
              <th className="px-6 py-4">Created Date</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-indigo-50/20 transition-colors group">
                <td className="px-6 py-4">
                  <span className="font-mono text-xs font-bold text-indigo-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 shadow-2xs">
                    {order.orderNumber}
                  </span>
                </td>

                <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {order.customer.name}
                </td>

                <td className="px-6 py-4">
                  <OrderStatusBadge status={order.status} />
                </td>

                <td className="px-6 py-4">
                  <PaymentStatusBadge status={order.paymentStatus} />
                </td>

                <td className="px-6 py-4 text-right font-extrabold text-slate-700">
                  {order.items.length} items
                </td>

                <td className="px-6 py-4 text-right font-black text-slate-900 text-base">
                  ${Number(order.total).toFixed(2)}
                </td>

                <td className="px-6 py-4 text-xs font-medium text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>

                <td className="px-6 py-4 text-center">
                  <Link
                    href={`/orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-2xs"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
"use client";

import { SalesOrderAggregate } from "../hooks/useOrders";
import { CheckCircle2, Clock, Truck, Package, FileText, Ban } from "lucide-react";
import { OrderStatus } from "@/types/order.dto";

interface Props {
  orders: SalesOrderAggregate[];
  loading: boolean;
  onSelectOrder?: (order: SalesOrderAggregate) => void;
  onShipOrder?: (order: SalesOrderAggregate) => void;
}

export function SalesOrderTable({ orders, loading, onSelectOrder, onShipOrder }: Props) {
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.SHIPPED:
      case OrderStatus.DELIVERED:
      case OrderStatus.COMPLETED:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" /> {status}
          </span>
        );
      case OrderStatus.CONFIRMED:
      case OrderStatus.RESERVED:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200">
            <Package className="h-3.5 w-3.5" /> {status}
          </span>
        );
      case OrderStatus.PICKING:
      case OrderStatus.PACKING:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
            <Clock className="h-3.5 w-3.5" /> {status}
          </span>
        );
      case OrderStatus.CANCELLED:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 border border-red-200">
            <Ban className="h-3.5 w-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading sales orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="p-12 text-center">
        <FileText className="mx-auto h-10 w-10 text-slate-400 mb-3" />
        <h3 className="text-base font-bold text-slate-900">No Sales Orders Found</h3>
        <p className="text-xs text-slate-500 mt-1">Create your first customer sales order to initiate fulfillment.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
          <tr>
            <th className="px-6 py-4">Order Number</th>
            <th className="px-6 py-4">Customer</th>
            <th className="px-6 py-4 text-right">Total Amount</th>
            <th className="px-6 py-4 text-center">Status</th>
            <th className="px-6 py-4">Created Date</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-indigo-50/20 transition-colors group">
              <td className="px-6 py-4">
                <span className="font-mono text-xs font-bold text-indigo-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 shadow-2xs">
                  {order.orderNumber}
                </span>
              </td>
              <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {order.customer?.legalName || "N/A"}
              </td>
              <td className="px-6 py-4 text-right font-black text-slate-900 text-base">
                ${Number(order.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </td>
              <td className="px-6 py-4 text-center">{getStatusBadge(order.status)}</td>
              <td className="px-6 py-4 text-xs font-medium text-slate-500">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right">
                {order.status !== OrderStatus.SHIPPED && order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED && (
                  <button
                    onClick={() => onShipOrder?.(order)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all shadow-2xs cursor-pointer"
                  >
                    <Truck className="h-3.5 w-3.5" />
                    Dispatch Shipment
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

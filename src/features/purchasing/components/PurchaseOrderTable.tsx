"use client";

import { PurchaseOrderAggregate } from "../hooks/usePurchaseOrders";
import { PackageCheck, CheckCircle2, Clock, Truck, FileText, Ban } from "lucide-react";

interface Props {
  orders: PurchaseOrderAggregate[];
  loading: boolean;
  onReceive: (po: PurchaseOrderAggregate) => void;
  onStatusChange?: (id: string, status: string) => void;
}

export function PurchaseOrderTable({ orders, loading, onReceive, onStatusChange }: Props) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RECEIVED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" /> Received
          </span>
        );
      case "PARTIALLY_RECEIVED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
            <Clock className="h-3.5 w-3.5" /> Partial
          </span>
        );
      case "SENT":
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200">
            <Truck className="h-3.5 w-3.5" /> {status}
          </span>
        );
      case "CANCELLED":
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
    return <div className="p-12 text-center text-xs text-slate-400">Loading purchase orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="p-12 text-center">
        <FileText className="mx-auto h-10 w-10 text-slate-400 mb-3" />
        <h3 className="text-base font-bold text-slate-900">No Purchase Orders Found</h3>
        <p className="text-xs text-slate-500 mt-1">Create your first PO to start ordering inventory from suppliers.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
          <tr>
            <th className="px-6 py-4">PO Number</th>
            <th className="px-6 py-4">Supplier</th>
            <th className="px-6 py-4 text-right">Total Amount</th>
            <th className="px-6 py-4 text-center">Status</th>
            <th className="px-6 py-4">Created Date</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {orders.map((po) => (
            <tr key={po.id} className="hover:bg-indigo-50/20 transition-colors group">
              <td className="px-6 py-4">
                <span className="font-mono text-xs font-bold text-indigo-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 shadow-2xs">
                  {po.poNumber}
                </span>
              </td>
              <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {po.supplier?.name || "N/A"}
              </td>
              <td className="px-6 py-4 text-right font-black text-slate-900 text-base">
                ${Number(po.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </td>
              <td className="px-6 py-4 text-center">{getStatusBadge(po.status)}</td>
              <td className="px-6 py-4 text-xs font-medium text-slate-500">
                {new Date(po.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right">
                {po.status !== "RECEIVED" && po.status !== "CANCELLED" && (
                  <button
                    onClick={() => onReceive(po)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all shadow-2xs cursor-pointer"
                  >
                    <PackageCheck className="h-3.5 w-3.5" />
                    Receive Goods
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

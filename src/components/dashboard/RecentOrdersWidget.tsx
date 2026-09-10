"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, ArrowRight, CheckCircle2, Clock, Truck } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  customer?: {
    name: string;
  };
}

export default function RecentOrdersWidget() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const json = await res.json();
      if (Array.isArray(json)) {
        setOrders(json.slice(0, 5));
      } else if (json.data && Array.isArray(json.data)) {
        setOrders(json.data.slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Delivered</span>;
      case "SHIPPED":
        return <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">Shipped</span>;
      case "PROCESSING":
        return <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">Processing</span>;
      default:
        return <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all hover:shadow-md">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <ShoppingCart className="h-4 w-4" />
          </span>
          <h3 className="text-base font-bold text-slate-900">Recent Sales Activity</h3>
        </div>

        <Link href="/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
          <span>View All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="p-6 text-center text-xs text-slate-400">Loading sales activity...</div>
      ) : orders.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500">
          No recent sales orders recorded yet.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {orders.map((o) => (
            <div key={o.id} className="flex items-center justify-between py-3">
              <div>
                <div className="text-xs font-bold text-indigo-600">{o.orderNumber}</div>
                <div className="text-xs text-slate-500">{o.customer?.name || "Retail Customer"}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900">
                  ${Number(o.total || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
                <div className="mt-0.5">{getStatusBadge(o.status)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { ShoppingBag, Clock, Truck, DollarSign } from "lucide-react";
import { OrderStats } from "@/types/order.dto";

interface Props {
  stats: OrderStats | null;
  loading: boolean;
}

export function OrderKPIs({ stats, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: "Total Sales Orders",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingBag,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    {
      title: "Open Orders",
      value: stats?.openOrdersCount ?? 0,
      icon: Clock,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      title: "Shipped Orders",
      value: stats?.shippedOrdersCount ?? 0,
      icon: Truck,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      title: "Total Sales Revenue",
      value: `$${(stats?.totalRevenue ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div key={idx} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.title}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{kpi.value}</h3>
            </div>
            <div className={`p-3 rounded-xl border ${kpi.color}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

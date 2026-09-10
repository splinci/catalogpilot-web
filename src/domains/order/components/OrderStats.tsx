"use client";

import Card from "@/components/ui/Card";
import {
  ShoppingCart,
  IndianRupee,
  Clock3,
  CheckCircle2,
} from "lucide-react";

interface OrderStatsProps {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
}

export function OrderStats({
  totalOrders,
  totalRevenue,
  pendingOrders,
  deliveredOrders,
}: OrderStatsProps) {
  const stats = [
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString("en-IN"),
      subtitle: "All customer orders",
      icon: ShoppingCart,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      })}`,
      subtitle: "Sales generated",
      icon: IndianRupee,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "Pending Orders",
      value: pendingOrders.toLocaleString("en-IN"),
      subtitle: "Awaiting fulfillment",
      icon: Clock3,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      title: "Delivered",
      value: deliveredOrders.toLocaleString("en-IN"),
      subtitle: "Completed orders",
      icon: CheckCircle2,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card
            key={stat.title}
            className="transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>

                <h2 className="text-3xl font-bold tracking-tight">
                  {stat.value}
                </h2>

                <p className="text-xs text-muted-foreground">
                  {stat.subtitle}
                </p>
              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconBg}`}
              >
                <Icon
                  className={`h-6 w-6 ${stat.iconColor}`}
                />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
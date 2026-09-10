"use client";

import StatCard from "@/components/common/StatCard";

interface AdminStat {
  title: string;
  value: number | string;
  subtitle?: string;
}

interface AdminStatsProps {
  stats: AdminStat[];
}

export function AdminStats({
  stats,
}: AdminStatsProps) {
  return (
    <div className="mb-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
        />
      ))}
    </div>
  );
}
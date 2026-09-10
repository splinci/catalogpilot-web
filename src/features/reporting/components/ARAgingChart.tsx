"use client";

interface AgingBucket {
  amount: number;
  count: number;
}

interface ARAgingChartProps {
  current?: AgingBucket;
  days31_60?: AgingBucket;
  days61_90?: AgingBucket;
  days91_120?: AgingBucket;
  over120?: AgingBucket;
}

const BUCKETS = [
  { key: "current",    label: "Current\n(0–30 days)",  color: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  { key: "days31_60", label: "31–60 Days",             color: "bg-sky-500",     text: "text-sky-700",     bg: "bg-sky-50 border-sky-200" },
  { key: "days61_90", label: "61–90 Days",             color: "bg-amber-500",   text: "text-amber-700",   bg: "bg-amber-50 border-amber-200" },
  { key: "days91_120",label: "91–120 Days",            color: "bg-orange-500",  text: "text-orange-700",  bg: "bg-orange-50 border-orange-200" },
  { key: "over120",   label: "120+ Days",              color: "bg-rose-600",    text: "text-rose-700",    bg: "bg-rose-50 border-rose-200" },
] as const;

export function ARAgingChart({ current, days31_60, days61_90, days91_120, over120 }: ARAgingChartProps) {
  const dataMap: Record<string, AgingBucket | undefined> = { current, days31_60, days61_90, days91_120, over120 };
  const total = BUCKETS.reduce((sum, b) => sum + (dataMap[b.key]?.amount ?? 0), 0);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 text-sm">Accounts Receivable Aging</h3>
        <p className="text-xs text-slate-400 mt-0.5">Total outstanding: {total > 0 ? `$${(total / 1000).toFixed(1)}K` : "—"}</p>
      </div>

      {/* Stacked bar */}
      <div className="px-5 pt-4">
        <div className="flex w-full h-3 rounded-full overflow-hidden gap-0.5">
          {BUCKETS.map((b) => {
            const amt = dataMap[b.key]?.amount ?? 0;
            const pct = total > 0 ? (amt / total) * 100 : 0;
            return pct > 0 ? (
              <div key={b.key} className={`h-full ${b.color} transition-all`} style={{ width: `${pct}%` }} title={`${b.label}: $${(amt / 1000).toFixed(1)}K`} />
            ) : null;
          })}
        </div>
      </div>

      {/* Buckets */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-5">
        {BUCKETS.map((b) => {
          const bucket = dataMap[b.key];
          const amt = bucket?.amount ?? 0;
          const count = bucket?.count ?? 0;
          const pct = total > 0 ? (amt / total) * 100 : 0;
          return (
            <div key={b.key} className={`rounded-xl border p-3 ${b.bg}`}>
              <p className={`text-xs font-bold whitespace-pre-line leading-tight mb-2 ${b.text}`}>{b.label}</p>
              <p className="text-lg font-black text-slate-900 tabular-nums">${(amt / 1000).toFixed(1)}K</p>
              <p className="text-xs text-slate-500 mt-0.5">{count} inv · {pct.toFixed(0)}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

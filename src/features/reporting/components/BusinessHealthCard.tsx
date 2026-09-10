"use client";

import { Shield } from "lucide-react";

interface BusinessHealthCardProps {
  score: number;
  rating: string;
  dimensions?: Record<string, string | number>;
}

const ratingConfig: Record<string, { bar: string; badge: string; bg: string; text: string }> = {
  EXCELLENT: { bar: "bg-emerald-400", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", bg: "bg-slate-900/60 backdrop-blur-xl border border-slate-800 shadow-xl", text: "text-emerald-400" },
  STRONG:    { bar: "bg-sky-400",     badge: "bg-sky-500/10 text-sky-400 border-sky-500/20",             bg: "bg-slate-900/60 backdrop-blur-xl border border-slate-800 shadow-xl", text: "text-sky-400" },
  FAIR:      { bar: "bg-amber-400",   badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",       bg: "bg-slate-900/60 backdrop-blur-xl border border-slate-800 shadow-xl", text: "text-amber-400" },
  CRITICAL:  { bar: "bg-rose-400",    badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",         bg: "bg-slate-900/60 backdrop-blur-xl border border-slate-800 shadow-xl", text: "text-rose-400" },
};

const DIMENSIONS = [
  { key: "revenueMomentum",  label: "Revenue Momentum" },
  { key: "profitability",    label: "Profitability" },
  { key: "liquidity",        label: "Liquidity" },
  { key: "efficiency",       label: "Operational Efficiency" },
  { key: "customerHealth",   label: "Customer Health" },
];

function dimensionScore(val: string | number | undefined): number {
  if (val == null) return 50;
  if (typeof val === "number") return Math.min(100, val);
  const map: Record<string, number> = { EXCELLENT: 95, STRONG: 80, GOOD: 70, FAIR: 55, WEAK: 35, CRITICAL: 20 };
  return map[String(val).toUpperCase()] ?? 50;
}

export function BusinessHealthCard({ score, rating, dimensions }: BusinessHealthCardProps) {
  const cfg = ratingConfig[rating] ?? ratingConfig.FAIR;

  return (
    <div className={`rounded-2xl p-6 ${cfg.bg}`}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${cfg.badge}`}>
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className={`font-bold text-sm ${cfg.text}`}>Splinci Business Health Score</h3>
            <p className="text-xs text-slate-400 font-medium">Enterprise composite across 12 dimensions</p>
          </div>
        </div>
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${cfg.badge}`}>
          {rating}
        </span>
      </div>

      <div className="flex items-end gap-3 mb-4">
        <span className="text-6xl font-black text-white tabular-nums leading-none">{score}</span>
        <span className="text-2xl text-slate-500 font-bold mb-1">/100</span>
      </div>

      <div className="w-full bg-slate-950 rounded-full h-3 mb-6 border border-slate-800">
        <div
          className={`h-2.5 rounded-full transition-all duration-700 ${cfg.bar}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {dimensions && (
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          {DIMENSIONS.map(({ key, label }) => {
            const val = dimensions[key];
            const pct = dimensionScore(val);
            return (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-300">{label}</span>
                  <span className={`font-bold ${cfg.text}`}>{typeof val === "number" ? `${val}` : String(val ?? "—")}</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-800">
                  <div className={`h-1.5 rounded-full ${cfg.bar} opacity-70`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

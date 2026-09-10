"use client";

import { ShieldCheck } from "lucide-react";

export default function HealthScore() {
  const domains = [
    { domain: "Products Master", score: 98, status: "HEALTHY" },
    { domain: "Inventory Quantities", score: 96, status: "HEALTHY" },
    { domain: "Orders Fulfillment", score: 99, status: "HEALTHY" },
    { domain: "WMS Facilities", score: 100, status: "HEALTHY" },
    { domain: "Finance & Accounts", score: 97, status: "HEALTHY" },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" /> Executive Health Dashboard
        </h3>
        <span className="text-xs font-mono font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          97.2% Platform Health
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
        {domains.map((dh) => (
          <div key={dh.domain} className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-center space-y-1">
            <span className="font-bold text-slate-500 block truncate">{dh.domain}</span>
            <span className="text-lg font-black text-slate-900 block">{dh.score}%</span>
            <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block">
              {dh.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

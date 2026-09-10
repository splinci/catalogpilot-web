"use client";

import { Sparkles } from "lucide-react";

export default function AIInsights() {
  const recommendations: any[] = [];

  return (
    <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-900 via-slate-950 to-indigo-950 p-6 text-white shadow-xl space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-purple-800/60 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-300" />
          <h3 className="text-base font-extrabold">🤖 Splinci AI Executive Insights &amp; Recommendations</h3>
        </div>
        <span className="text-[11px] font-mono font-bold text-purple-300 bg-purple-900/60 px-3 py-1 rounded-full border border-purple-700">
          Categorized AI Engine
        </span>
      </div>

      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.title}
              className="rounded-xl border border-purple-800/50 bg-purple-950/40 p-4 space-y-2.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-amber-300">{rec.title}</span>
                  <span className="text-[10px] font-mono font-bold text-purple-200 bg-purple-900/80 px-2 py-0.5 rounded">
                    {rec.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">{rec.text}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-slate-300 bg-purple-950/40 rounded-xl border border-purple-800/40">
          No automated AI recommendations generated for current tenant state.
        </div>
      )}
    </div>
  );
}

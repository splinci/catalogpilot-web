"use client";

import React from "react";
import { Cpu, Zap, Award, DollarSign, Activity, CheckCircle2 } from "lucide-react";

interface ModelUsage {
  model: string;
  provider: string;
  primaryTask: string;
  jobsCount: number;
  tokensConsumed: number;
  avgLatencyMs: number;
  avgQualityScore: number;
  estimatedCostUSD: number;
}

export const AIModelBreakdownTable: React.FC = () => {
  const models: ModelUsage[] = [
    {
      model: "Gemini 1.5 Pro",
      provider: "Google Cloud Vertex AI",
      primaryTask: "Bulk Product Copy & SEO Generation",
      jobsCount: 24,
      tokensConsumed: 324500,
      avgLatencyMs: 1240,
      avgQualityScore: 96.4,
      estimatedCostUSD: 0.081,
    },
    {
      model: "Gemini 1.5 Flash",
      provider: "Google Cloud Vertex AI",
      primaryTask: "Taxonomy Classification & Tagging",
      jobsCount: 15,
      tokensConsumed: 142000,
      avgLatencyMs: 420,
      avgQualityScore: 92.1,
      estimatedCostUSD: 0.018,
    },
    {
      model: "Claude 3.5 Sonnet",
      provider: "Anthropic Bedrock",
      primaryTask: "Brand Registry & Attribute Extraction",
      jobsCount: 3,
      tokensConsumed: 58500,
      avgLatencyMs: 1850,
      avgQualityScore: 97.8,
      estimatedCostUSD: 0.045,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl overflow-hidden font-sans">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Cpu className="h-4 w-4 text-indigo-400" />
            LLM Model Telemetry &amp; Token Breakdown
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Performance, inference latency, quality outputs, and unit economics across active AI foundation models.
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
          3 Active Models
        </span>
      </div>

      <table className="w-full text-left text-xs">
        <thead className="border-b border-slate-800 bg-slate-950/80 font-extrabold uppercase text-slate-400 tracking-wider text-[10px]">
          <tr>
            <th className="px-6 py-3.5">Model &amp; Provider</th>
            <th className="px-6 py-3.5">Primary Task</th>
            <th className="px-6 py-3.5 text-center">Jobs Executed</th>
            <th className="px-6 py-3.5 text-right">Tokens Consumed</th>
            <th className="px-6 py-3.5 text-right">Avg Latency</th>
            <th className="px-6 py-3.5 text-center">Quality Score</th>
            <th className="px-6 py-3.5 text-right">Est. Cost</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-medium text-slate-200">
          {models.map((m, i) => (
            <tr key={i} className="hover:bg-slate-800/40 transition-colors">
              <td className="px-6 py-4">
                <div className="font-bold text-white text-sm">{m.model}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{m.provider}</div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1.5 font-bold text-slate-300">
                  <Zap className="h-3.5 w-3.5 text-amber-400" /> {m.primaryTask}
                </span>
              </td>
              <td className="px-6 py-4 text-center font-bold">{m.jobsCount}</td>
              <td className="px-6 py-4 text-right font-mono text-indigo-300 font-bold">
                {m.tokensConsumed.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-right font-mono text-slate-300">{m.avgLatencyMs} ms</td>
              <td className="px-6 py-4 text-center">
                <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <Award className="h-3 w-3" /> {m.avgQualityScore}/100
                </span>
              </td>
              <td className="px-6 py-4 text-right font-mono font-black text-amber-400">
                ${m.estimatedCostUSD.toFixed(3)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

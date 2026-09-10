"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { History, Download, CheckCircle2, AlertCircle, FileSpreadsheet, Sparkles } from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: string;
  method: string;
  totalProducts: number;
  aiGenerated: number;
  manualCreated: number;
  status: string;
  author: string;
}

export default function CatalogHistoryPage() {
  const [logs, setLogs] = useState<AuditLog[]>([
    {
      id: "LOG-9001",
      timestamp: "Today, 11:45 AM",
      method: "AI Assisted Single",
      totalProducts: 1,
      aiGenerated: 1,
      manualCreated: 0,
      status: "STAGED",
      author: "Admin User",
    },
    {
      id: "LOG-9000",
      timestamp: "Yesterday, 4:20 PM",
      method: "Manual Bulk Import",
      totalProducts: 500,
      aiGenerated: 0,
      manualCreated: 500,
      status: "PUBLISHED",
      author: "Admin User",
    },
    {
      id: "LOG-8999",
      timestamp: "Jul 30, 2026",
      method: "AI Bulk Catalog",
      totalProducts: 80,
      aiGenerated: 80,
      manualCreated: 0,
      status: "PUBLISHED",
      author: "Admin User",
    },
  ]);

  const handleDownloadReport = (logId: string) => {
    alert(`Downloading Audit Execution Report for ${logId}...`);
  };

  return (
    <div className="space-y-8">
      <PageHero
        title="Creation History & Audit Logs"
        description="Comprehensive audit trail of all manual and AI creation events, bulk spreadsheet imports, quality scores, and team publishing activity."
      />

      {/* History Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold">
            <History className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Creation Batches</div>
            <div className="text-xl font-black text-slate-900">581 Products Created</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 font-bold">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Generation Ratio</div>
            <div className="text-xl font-black text-slate-900">81 AI Products</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Audit Pass Rate</div>
            <div className="text-xl font-black text-slate-900">99.2% Valid</div>
          </div>
        </div>
      </div>

      {/* History Log Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
            <tr>
              <th className="px-6 py-4">Batch ID</th>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Creation Method</th>
              <th className="px-6 py-4 text-right">Total Products</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4">Triggered By</th>
              <th className="px-6 py-4 text-right">Audit Report</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-indigo-50/20 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-mono text-xs font-bold text-indigo-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                    {log.id}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-semibold text-slate-700">{log.timestamp}</td>
                <td className="px-6 py-4 text-xs font-bold text-slate-900">{log.method}</td>
                <td className="px-6 py-4 text-right font-extrabold text-slate-900">{log.totalProducts} items</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" /> {log.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-600 font-medium">{log.author}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDownloadReport(log.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-2xs"
                  >
                    <Download className="h-3.5 w-3.5" /> Report
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

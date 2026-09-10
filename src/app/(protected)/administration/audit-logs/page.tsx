"use client";

import { PageHero } from "@/components/layout/PageHero";
import { ShieldCheck } from "lucide-react";

interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  resource: string;
  ip: string;
  timestamp: string;
  status: "SUCCESS" | "WARNING" | "BLOCKED";
}

export default function AuditLogsPage() {
  const auditLogs: AuditEntry[] = [];

  return (
    <div className="space-y-8 font-sans">
      <PageHero
        title="Platform Audit Log Center"
        description="Comprehensive security audit trail tracking user authentication events, RBAC permission changes, product approvals, and financial transactions."
      />

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
        {auditLogs.length > 0 ? (
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/90 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Log ID</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action Performed</th>
                <th className="px-6 py-4">Target Resource</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-400">
                    {log.id}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-200">{log.actor}</td>
                  <td className="px-6 py-4 font-mono text-xs font-bold text-purple-400">{log.action}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-300">{log.resource}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{log.ip}</td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-medium">{log.timestamp}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-lg border ${
                        log.status === "SUCCESS"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center space-y-3 bg-slate-950/40">
            <ShieldCheck className="h-10 w-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-200">No Security Audit Logs Recorded</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No platform security audit events logged yet. Security and administrative actions are logged automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

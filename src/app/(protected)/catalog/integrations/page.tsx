"use client";

import { useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Store, RefreshCw, CheckCircle2, Settings, Plus, Zap } from "lucide-react";

interface IntegrationConnector {
  id: string;
  platform: string;
  type: string;
  status: "CONNECTED" | "DISCONNECTED" | "SYNCING";
  lastSync: string;
  productsSynced: number;
}

export default function ApiIntegrationsPage() {
  const [connectors, setConnectors] = useState<IntegrationConnector[]>([]);

  const handleTriggerSync = (connectorId: string) => {
    alert(`Triggering live bi-directional sync for connector ${connectorId}...`);
  };

  return (
    <div className="space-y-8 font-sans">
      <PageHero
        title="Live External API Sync Connectors"
        description="Bi-directional live catalog synchronization connectors for Shopify GraphQL, Amazon Selling Partner API (SP-API), Walmart Marketplace, EDI 832 feeds, and REST Webhooks."
        actions={
          <button
            onClick={() => alert("Opening API Connector Configuration...")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Integration Connector</span>
          </button>
        }
      />

      {/* Connectors Grid */}
      {connectors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {connectors.map((conn) => (
            <div
              key={conn.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                    {conn.id}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                      conn.status === "CONNECTED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" /> {conn.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{conn.platform}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{conn.type}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                  <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Products Synced</div>
                    <div className="font-black text-slate-900 mt-0.5">{conn.productsSynced} items</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Last Synchronization</div>
                    <div className="font-semibold text-slate-700 mt-0.5">{conn.lastSync}</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                <button
                  onClick={() => alert(`Configuring API credentials for ${conn.platform}...`)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-indigo-600 cursor-pointer"
                >
                  <Settings className="h-3.5 w-3.5" /> Configure Credentials
                </button>

                <button
                  onClick={() => handleTriggerSync(conn.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-600 transition-all cursor-pointer shadow-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Sync Now
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center space-y-3 shadow-xs">
          <Zap className="h-10 w-10 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900">No Integration Connectors Configured</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No live external marketplace API connectors configured for this tenant. Click the button above to add a connector.
          </p>
        </div>
      )}
    </div>
  );
}

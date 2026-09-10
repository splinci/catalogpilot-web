"use client";

import { useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Code2, Key, Globe, Copy, Plus, CheckCircle2, ShieldAlert } from "lucide-react";

export default function DeveloperPortalPage() {
  const [apiKey, setApiKey] = useState("ak_live_894f29a0b1274c5d88921a99");
  const [copied, setCopied] = useState(false);

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <PageHero
        title="Developer API Portal & Webhooks Manager"
        description="Public REST API documentation, API Key management (Bearer Authentication), and Webhook event subscriptions for external partner integrations."
        actions={
          <button
            onClick={() => setApiKey(`ak_live_${Math.random().toString(36).substring(2, 18)}`)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Generate New API Key</span>
          </button>
        }
      />

      {/* API Key Panel */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-indigo-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">Production Secret API Key</h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">Active Key</span>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            readOnly
            value={apiKey}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs font-bold text-slate-800 shadow-2xs"
          />
          <button
            onClick={copyKey}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white hover:bg-indigo-600 transition-all cursor-pointer shrink-0 shadow-xs"
          >
            {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? "Copied!" : "Copy Key"}</span>
          </button>
        </div>
      </div>

      {/* Webhooks Section */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-purple-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">Active Webhook Event Endpoints</h3>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 flex items-center justify-between">
            <div>
              <span className="font-mono text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                product.published
              </span>
              <p className="text-xs text-slate-600 mt-1 font-mono">https://api.storefront.com/webhooks/atlas-sync</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Active (200 OK)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

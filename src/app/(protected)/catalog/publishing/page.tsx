"use client";

import { useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Edit3, Globe } from "lucide-react";

interface ChannelOverride {
  id: string;
  sku: string;
  productName: string;
  basePrice: number;
  channelPrices: {
    web: number;
    amazon: number;
    walmart: number;
  };
  channelTitles: {
    web: string;
    amazon: string;
  };
}

export default function ChannelPublishingPage() {
  const [overrides, setOverrides] = useState<ChannelOverride[]>([]);

  return (
    <div className="space-y-8 font-sans">
      <PageHero
        title="Channel Publishing &amp; Price Overrides Studio"
        description="Configure channel-specific pricing rules (offsetting marketplace commission fees), custom marketplace titles, localized bullet points, and channel publishing toggles."
      />

      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        {overrides.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
              <tr>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Base Master Price</th>
                <th className="px-6 py-4">🌐 Web Storefront</th>
                <th className="px-6 py-4">📦 Amazon Marketplace</th>
                <th className="px-6 py-4">🏬 Walmart Seller Center</th>
                <th className="px-6 py-4 text-center">Price Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {overrides.map((item) => (
                <tr key={item.id} className="hover:bg-indigo-50/20 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                      {item.sku}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-extrabold text-slate-900">${item.basePrice.toFixed(2)}</td>
                  <td className="px-6 py-4 font-bold text-blue-600">${item.channelPrices.web.toFixed(2)}</td>
                  <td className="px-6 py-4 font-bold text-amber-600">
                    ${item.channelPrices.amazon.toFixed(2)}
                    <span className="block text-[10px] text-slate-400 font-medium">+13.3% Marketplace Offset</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600">${item.channelPrices.walmart.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => alert(`Editing channel pricing overrides for ${item.sku}...`)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all cursor-pointer shadow-2xs"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit Rule
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center space-y-3 bg-slate-50">
            <Globe className="h-10 w-10 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">No Channel Price Overrides Configured</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No sales channel pricing override rules configured for this tenant yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

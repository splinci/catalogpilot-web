"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

interface AttentionItem {
  text: string;
  href: string;
  badge: string;
  priority: "CRITICAL" | "WARNING" | "INFO";
  color: string;
}

export default function AttentionPanel() {
  const items: AttentionItem[] = [
    { text: "7 Purchase Orders awaiting approval", href: "/purchasing", badge: "Approval Needed", priority: "WARNING", color: "text-amber-700 bg-amber-50 border-amber-200" },
    { text: "18 Products below reorder level threshold", href: "/inventory", badge: "Low Stock", priority: "CRITICAL", color: "text-red-700 bg-red-50 border-red-200" },
    { text: "3 Sales Orders delayed in transit", href: "/orders", badge: "Delayed", priority: "WARNING", color: "text-purple-700 bg-purple-50 border-purple-200" },
    { text: "2 Marketplace sync failures reported", href: "/catalog/integrations", badge: "Sync Error", priority: "CRITICAL", color: "text-red-700 bg-red-50 border-red-200" },
    { text: "4 Products pending review in Catalog Studio", href: "/catalog/workspace", badge: "Review Gate", priority: "INFO", color: "text-blue-700 bg-blue-50 border-blue-200" },
    { text: "1 Supplier invoice overdue for payment", href: "/finance", badge: "Overdue", priority: "CRITICAL", color: "text-red-700 bg-red-50 border-red-200" },
  ];

  return (
    <div className="rounded-2xl border border-amber-200/90 bg-amber-50/20 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600 animate-bounce" /> ⚠️ Needs Your Attention (Action Gate)
        </h3>
        <span className="text-xs font-mono font-extrabold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
          {items.length} Critical Actions
        </span>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => (
          <Link
            key={item.text}
            href={item.href}
            className="rounded-xl border border-slate-200/80 bg-white p-3.5 flex items-center justify-between hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-md border ${item.color}`}>
                {item.badge}
              </span>
              <span className="text-xs font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors">
                {item.text}
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}

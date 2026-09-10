"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Wand2, Cpu, Boxes, Layers, Code, ArrowRight } from "lucide-react";

export const AIQuickLauncherGrid: React.FC = () => {
  const tools = [
    {
      title: "AI Content Studio",
      description: "Interactive single & bulk product description, title, and SEO copy generation.",
      href: "/ai/content",
      icon: Wand2,
      color: "from-purple-600 to-indigo-600",
      badge: "STUDIO",
    },
    {
      title: "AI Single SKU Generator",
      description: "Quick single product catalog creation with automated attribute tagging.",
      href: "/catalog/ai/single",
      icon: Cpu,
      color: "from-indigo-600 to-blue-600",
      badge: "SINGLE",
    },
    {
      title: "AI Bulk Batch Generator",
      description: "Upload CSV or supplier feeds to enrich thousands of catalog SKUs in parallel.",
      href: "/catalog/ai/bulk",
      icon: Boxes,
      color: "from-blue-600 to-cyan-600",
      badge: "BULK",
    },
    {
      title: "AI Catalog Enrichment",
      description: "Automated taxonomy classification, image ALT text, and specification extraction.",
      href: "/ai/enrichment",
      icon: Layers,
      color: "from-purple-600 to-pink-600",
      badge: "ENRICH",
    },
    {
      title: "AI Execution Queue",
      description: "Monitor async background jobs, token consumption, and failure retry queues.",
      href: "/ai/jobs",
      icon: Cpu,
      color: "from-slate-700 to-slate-900",
      badge: "QUEUE",
    },
    {
      title: "AI System Prompts",
      description: "Configure system prompts, brand voice guidelines, and LLM temperature rules.",
      href: "/ai/prompts",
      icon: Code,
      color: "from-slate-800 to-slate-950",
      badge: "PROMPTS",
    },
  ];

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-400" />
          AI Commerce Engines &amp; Workspaces
        </h3>
        <span className="text-xs text-slate-400 font-medium">Select an engine to launch</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((t, i) => {
          const Icon = t.icon;
          return (
            <Link
              key={i}
              href={t.href}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl hover:border-slate-700/80 hover:bg-slate-900/90 transition-all group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${t.color} text-white shadow-md`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-[10px] font-extrabold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                    {t.badge}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {t.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-end text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors pt-2 border-t border-slate-800/60">
                <span>Launch Engine</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

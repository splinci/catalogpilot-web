"use client";

import React from "react";
import { Code, CheckCircle, Copy, Send } from "lucide-react";

interface PromptTemplateTableProps {
  templates: any[];
  loading?: boolean;
  onPublish?: (id: string) => void;
  onClone?: (id: string) => void;
  onEdit?: (template: any) => void;
}

export const PromptTemplateTable: React.FC<PromptTemplateTableProps> = ({
  templates,
  loading = false,
  onPublish,
  onClone,
  onEdit,
}) => {
  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800 animate-pulse text-xs font-semibold">
        Loading AI prompt templates...
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
        <Code className="w-10 h-10 text-purple-400 mx-auto mb-3 opacity-60" />
        <h3 className="text-xs font-bold text-slate-300">No prompt templates found</h3>
        <p className="text-xs text-slate-400 mt-1">
          Create custom AI prompt templates to standardize catalog generation.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-950/90 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
          <tr>
            <th className="px-6 py-3.5">Prompt Name / Code</th>
            <th className="px-6 py-3.5">Type</th>
            <th className="px-6 py-3.5">Version</th>
            <th className="px-6 py-3.5">Status</th>
            <th className="px-6 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-medium">
          {templates.map((tpl, idx) => {
            const isPublished = tpl.isPublished;

            return (
              <tr key={tpl.id || idx} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-100">{tpl.name || "Custom Prompt Template"}</div>
                  <div className="text-xs font-mono text-purple-400 font-bold mt-0.5">{tpl.code || tpl.key}</div>
                </td>
                <td className="px-6 py-4 text-xs font-semibold text-slate-300">
                  {tpl.type || "CONTENT_GENERATION"}
                </td>
                <td className="px-6 py-4 text-xs font-mono text-slate-400">
                  v{tpl.version || 1}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
                      isPublished
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                    }`}
                  >
                    {isPublished ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : null}
                    <span>{isPublished ? "Published" : "Draft"}</span>
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {onClone && (
                    <button
                      onClick={() => onClone(tpl.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Clone Template"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                  {!isPublished && onPublish && (
                    <button
                      onClick={() => onPublish(tpl.id)}
                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-xs"
                      title="Publish Prompt"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

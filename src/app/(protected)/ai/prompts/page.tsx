"use client";

import React, { useState } from "react";
import { Code, Plus } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { usePromptTemplates } from "@/features/ai/hooks/usePromptTemplates";
import { PromptTemplateTable } from "@/features/ai/components/PromptTemplateTable";

export default function AIPromptsWorkspacePage() {
  const { templates, loading, error, createTemplate, publishTemplate, cloneTemplate } = usePromptTemplates();
  const [name, setName] = useState("");
  const [templateText, setTemplateText] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !templateText) return;
    setIsCreating(true);
    try {
      await createTemplate({
        name,
        code: name.toLowerCase().replace(/[^a-z0-9]+/g, "_") || `prompt_${Date.now()}`,
        type: "CONTENT_GENERATION",
        templateText,
      });
      setName("");
      setTemplateText("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHero
        title="AI Prompt Templates"
        description="Create, version, and manage AI catalog generation prompt templates across product categories."
        badge="AI Prompt Engineering"
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
          {error}
        </div>
      )}

      {/* New Prompt Form */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Create New AI System Prompt Template
        </h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Template Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Enterprise Laptop SEO Prompt Template v2"
              required
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Prompt Instructions</label>
            <textarea
              value={templateText}
              onChange={(e) => setTemplateText(e.target.value)}
              rows={3}
              placeholder="You are an enterprise catalog AI. Generate a professional product title and 5 key feature bullets..."
              required
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isCreating}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              {isCreating ? "Saving Template..." : "Save Prompt Template"}
            </button>
          </div>
        </form>
      </div>

      {/* Templates Table */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Template Directory
        </h2>
        <PromptTemplateTable
          templates={templates}
          loading={loading}
          onPublish={publishTemplate}
          onClone={cloneTemplate}
        />
      </div>
    </div>
  );
}

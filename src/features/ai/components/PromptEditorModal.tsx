"use client";

import React, { useState, useMemo } from "react";
import { X, Code, Sparkles, Cpu } from "lucide-react";

interface PromptEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<any>;
}

export const PromptEditorModal: React.FC<PromptEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState("CONTENT_GENERATION");
  const [templateText, setTemplateText] = useState(
    "Generate a professional catalog description for product {{product}}, under category {{category}} by brand {{brand}} with attributes {{attributes}} and keywords {{keywords}}."
  );
  const [loading, setLoading] = useState(false);

  const estimatedTokens = useMemo(() => {
    return Math.ceil((templateText || "").length / 4);
  }, [templateText]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !templateText) return;
    setLoading(true);
    try {
      await onSave({
        name,
        code,
        type,
        templateText,
        variables: ["product", "brand", "category", "attributes", "keywords"],
        version: 1,
        isPublished: false,
        isActive: true,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const insertVariable = (varName: string) => {
    setTemplateText((prev) => `${prev} {{${varName}}}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Create AI Prompt Template</h2>
            <p className="text-xs text-slate-400">
              Configure prompt rules with dynamic variable substitution.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Template Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Commercial Catalog Prompt"
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Unique Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. PROMPT_CATALOG_01"
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Insert Variable Placeholders
            </label>
            <div className="flex flex-wrap gap-2">
              {["product", "brand", "category", "attributes", "keywords"].map((v) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => insertVariable(v)}
                  className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-xs font-mono transition-colors"
                >
                  +{`{{${v}}}`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Prompt Template Instructions
              </label>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-purple-400" /> ~{estimatedTokens} Tokens
              </span>
            </div>
            <textarea
              value={templateText}
              onChange={(e) => setTemplateText(e.target.value)}
              rows={5}
              required
              className="w-full p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? "Saving..." : "Save Template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

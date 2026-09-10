"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, Zap, Layers, AlertCircle } from "lucide-react";
import { WorkflowTypeEnum } from "../../../types/workflow.dto";

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export function CreateWorkflowModal({ isOpen, onClose, onSubmit }: CreateWorkflowModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [workflowType, setWorkflowType] = useState<string>(WorkflowTypeEnum.PO_APPROVAL);
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError("Workflow Name is required");
      return;
    }
    const wfCode = code.trim() || `WF_${Date.now().toString().slice(-6)}`;

    setIsSubmitting(true);
    setValidationError(null);
    try {
      await onSubmit({
        name: name.trim(),
        workflowType,
        isActive,
        rules: {
          code: wfCode,
          description: description.trim(),
          version: 1,
          triggers: [
            {
              triggerType: "EVENT",
              eventType: `${workflowType}_TRIGGERED`,
            },
          ],
          steps: [
            {
              stepOrder: 1,
              name: "Initialize Step",
              stepType: "ACTION",
              approvalRequired: false,
            },
          ],
          retryPolicy: {
            maxRetries: 3,
            backoffSeconds: 60,
          },
        },
      });
      onClose();
    } catch (err: any) {
      setValidationError(err.message || "Failed to create workflow");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Create Workflow Definition</h2>
              <p className="text-xs text-slate-400">Configure new automation rule pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Workflow Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Purchase Order Executive Approval Workflow"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Workflow Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="WF_PO_APPROVE"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Workflow Type</label>
              <select
                value={workflowType}
                onChange={(e) => setWorkflowType(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-semibold"
              >
                {Object.values(WorkflowTypeEnum).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe business policy rules..."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
            />
            <label htmlFor="isActive" className="text-slate-300 font-semibold cursor-pointer">
              Activate workflow immediately upon creation
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? "Creating..." : "Create Workflow"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Zap, Play, Search, Code, CheckCircle2 } from "lucide-react";

interface WorkflowTriggerPanelProps {
  onEvaluate: (eventName: string, payload?: any) => Promise<any>;
  onProcess: (eventName: string, payload?: any) => Promise<any>;
}

export function WorkflowTriggerPanel({ onEvaluate, onProcess }: WorkflowTriggerPanelProps) {
  const [eventName, setEventName] = useState("PO_CREATED");
  const [payloadJson, setPayloadJson] = useState('{\n  "poId": "po_12345",\n  "totalAmount": 15000\n}');
  const [result, setResult] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsePayload = () => {
    try {
      return JSON.parse(payloadJson);
    } catch {
      throw new Error("Invalid JSON payload structure");
    }
  };

  const handleEvaluate = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const p = parsePayload();
      const res = await onEvaluate(eventName, p);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to evaluate triggers");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcess = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const p = parsePayload();
      const res = await onProcess(eventName, p);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to process trigger");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-4 shadow-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-100 text-sm">Event Trigger Tester</h3>
          <p className="text-slate-400">Simulate domain events and evaluate active workflow rules</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
          {error}
        </div>
      )}

      <div>
        <label className="block text-slate-300 font-semibold mb-1">Domain Event Name</label>
        <input
          type="text"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="PO_CREATED"
          className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-slate-300 font-semibold mb-1">Event Payload (JSON)</label>
        <textarea
          rows={4}
          value={payloadJson}
          onChange={(e) => setPayloadJson(e.target.value)}
          className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-1">
        <button
          onClick={handleEvaluate}
          disabled={isSubmitting}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition-all border border-slate-700 disabled:opacity-50"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Evaluate Triggers</span>
        </button>
        <button
          onClick={handleProcess}
          disabled={isSubmitting}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
        >
          <Play className="h-3.5 w-3.5" />
          <span>Process Event</span>
        </button>
      </div>

      {result && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Evaluation Result
          </span>
          <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

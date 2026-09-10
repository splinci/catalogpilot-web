/**
 * ============================================================================
 * Splinci Commerce OS — SystemSettingsTable Component
 * ============================================================================
 * Specification Reference: M12-004 / UI-001
 * Displays tenant system settings table & edit modal launcher
 * ============================================================================
 */

import React, { useState } from "react";
import { Settings, Lock, Edit2, Plus, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";

export function SystemSettingsTable({
  settings,
  onSaveSetting,
  onRefresh,
}: {
  settings: any[];
  onSaveSetting: (key: string, value: string) => Promise<void>;
  onRefresh?: () => void;
}) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenNew = () => {
    setEditingKey(null);
    setKeyInput("");
    setValueInput("");
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (setting: any) => {
    setEditingKey(setting.key);
    setKeyInput(setting.key);
    setValueInput(setting.value);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSaveSetting(keyInput, valueInput);
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err?.message || "Failed to save system setting");
    } finally {
      setSaving(false);
    }
  };

  const isProtectedKey = (key: string) => key.startsWith("SYSTEM_") || key.startsWith("SECURITY_");

  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-slate-100 font-semibold text-base">Tenant System Settings</h3>
            <p className="text-slate-400 text-xs">Operational parameters & system configuration</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenNew}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" /> Upsert Setting
          </button>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          )}
        </div>
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-800/90 rounded-xl border border-slate-700 space-y-3">
          <h4 className="text-slate-100 font-semibold text-sm">
            {editingKey ? `Edit Setting: ${editingKey}` : "Create New System Setting"}
          </h4>

          {error && (
            <div className="p-2 bg-red-950/60 border border-red-800 text-red-300 rounded text-xs">
              {error}
            </div>
          )}

          <div className="space-y-2 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Setting Key</label>
              <input
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
                disabled={!!editingKey}
                placeholder="e.g. PURCHASING_AUTO_APPROVE_THRESHOLD"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Setting Value</label>
              <textarea
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                placeholder="Enter setting value"
                rows={3}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded text-xs disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Setting"}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700/50">
            <tr>
              <th className="py-2.5 px-3">Setting Key</th>
              <th className="py-2.5 px-3">Current Value</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {settings.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  No system settings configured for this tenant.
                </td>
              </tr>
            ) : (
              settings.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-semibold text-slate-100 flex items-center gap-1.5">
                    {isProtectedKey(s.key) && <Lock className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{s.key}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300 truncate max-w-xs">{s.value}</td>
                  <td className="py-3 px-3">
                    {isProtectedKey(s.key) ? (
                      <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 rounded-full text-[9px] font-bold">PROTECTED</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-full text-[9px] font-bold">CUSTOM</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition"
                      title="Edit Setting"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

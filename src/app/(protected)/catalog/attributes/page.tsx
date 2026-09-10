"use client";

import { useEffect, useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Sliders, Plus, Tag, Check, Trash2, Pencil, X } from "lucide-react";

interface AttributeValueItem {
  id: string;
  value: string;
}

interface MasterAttribute {
  id: string;
  name: string;
  code: string;
  description?: string;
  values: AttributeValueItem[];
}

export default function MasterAttributesPage() {
  const [attributes, setAttributes] = useState<MasterAttribute[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Create & Edit
  const [isOpen, setIsOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState<MasterAttribute | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [valueInput, setValueInput] = useState("");
  const [valuesList, setValuesList] = useState<string[]>([]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/attributes");
      const json = await res.json();
      if (json.success) {
        setAttributes(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingAttr(null);
    setName("");
    setDescription("");
    setValueInput("");
    setValuesList([]);
    setFormError("");
    setIsOpen(true);
  };

  const handleOpenEdit = (attr: MasterAttribute) => {
    setEditingAttr(attr);
    setName(attr.name);
    setDescription(attr.description || "");
    setValueInput("");
    setValuesList(attr.values ? attr.values.map((v) => v.value) : []);
    setFormError("");
    setIsOpen(true);
  };

  const handleAddValue = () => {
    if (!valueInput.trim()) return;
    if (!valuesList.includes(valueInput.trim())) {
      setValuesList([...valuesList, valueInput.trim()]);
    }
    setValueInput("");
  };

  const handleRemoveValue = (val: string) => {
    setValuesList(valuesList.filter((v) => v !== val));
  };

  const handleSaveAttribute = async () => {
    setFormError("");
    if (!name.trim()) {
      setFormError("Please enter an Attribute Name.");
      return;
    }

    let finalValues = [...valuesList];
    if (valueInput.trim() && !finalValues.includes(valueInput.trim())) {
      finalValues.push(valueInput.trim());
    }

    setSubmitting(true);
    try {
      const url = editingAttr ? `/api/attributes/${editingAttr.id}` : "/api/attributes";
      const method = editingAttr ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          values: finalValues,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsOpen(false);
        fetchAttributes();
      } else {
        setFormError(json.message || "Failed to save master attribute.");
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAttribute = async (attr: MasterAttribute) => {
    if (!confirm(`Are you sure you want to delete attribute "${attr.name}"?`)) return;

    try {
      const res = await fetch(`/api/attributes/${attr.id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (json.success) {
        fetchAttributes();
      } else {
        alert(json.message || "Failed to delete attribute.");
      }
    } catch (err) {
      alert("Error deleting attribute.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHero
        title="Master Attributes Directory"
        description="Define standardized product attributes and preset dropdown option values for your PIM catalog."
        actions={
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Master Attribute</span>
          </button>
        }
      />

      {/* Attributes Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-indigo-400" />
            <span>Active Master Attributes ({attributes.length})</span>
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Loading master attributes...
          </div>
        ) : attributes.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No master attributes defined yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/90 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-3.5">Attribute Name</th>
                  <th className="px-6 py-3.5">Code</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5">Preset Option Values</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {attributes.map((attr) => (
                  <tr key={attr.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-100 flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-indigo-400" />
                      <span>{attr.name}</span>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-indigo-400 font-semibold">
                      {attr.code}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-400">
                      {attr.description || "-"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {attr.values.map((v) => (
                          <span
                            key={v.id}
                            className="inline-flex items-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-xs font-semibold text-indigo-300"
                          >
                            {v.value}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(attr)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-indigo-300 transition-colors cursor-pointer"
                          title="Edit Attribute"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAttribute(attr)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Attribute"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-extrabold text-slate-100">
                {editingAttr ? `Edit Attribute: ${editingAttr.name}` : "Add New Master Attribute"}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="rounded-xl bg-rose-500/10 p-3 text-xs font-semibold text-rose-400 border border-rose-500/20">
                ⚠️ {formError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Attribute Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Storage Capacity, Voltage, Color"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Device storage capacity options"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Add Values */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Preset Option Values
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 128GB, 256GB, 512GB"
                    value={valueInput}
                    onChange={(e) => setValueInput(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddValue}
                    className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    + Add
                  </button>
                </div>

                {valuesList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {valuesList.map((val) => (
                      <span
                        key={val}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-2xs"
                      >
                        <span>{val}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveValue(val)}
                          className="text-slate-400 hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAttribute}
                disabled={submitting}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? "Saving..." : editingAttr ? "Update Master Attribute" : "Save Master Attribute"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

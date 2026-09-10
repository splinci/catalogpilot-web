"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Sparkles, DollarSign, TrendingUp, Store, Globe, PackageCheck, Truck, Tags, Shapes, Plus, Trash2, Sliders } from "lucide-react";

import { Product, ProductAttribute } from "@/types/product";

type ProductFormProps = {
  product: Product;
  setProduct: React.Dispatch<React.SetStateAction<Product>>;
  setCatalog?: React.Dispatch<React.SetStateAction<any>>;
  showAiGenerate?: boolean;
};

interface OptionItem {
  id: string;
  name: string;
  code?: string;
}

export default function ProductForm({
  product,
  setProduct,
  setCatalog,
  showAiGenerate = false,
}: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<OptionItem[]>([]);
  const [categories, setCategories] = useState<OptionItem[]>([]);
  const [suppliers, setSuppliers] = useState<OptionItem[]>([]);

  // Attribute input & master attributes state
  const [masterAttributes, setMasterAttributes] = useState<any[]>([]);
  const [selectedAttrId, setSelectedAttrId] = useState("");
  const [attrKey, setAttrKey] = useState("");
  const [attrValue, setAttrValue] = useState("");
  const [presetValues, setPresetValues] = useState<string[]>([]);

  useEffect(() => {
    fetchOptions();
    fetchMasterAttributes();
  }, []);

  const fetchMasterAttributes = async () => {
    try {
      const res = await fetch("/api/attributes");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMasterAttributes(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch master attributes:", err);
    }
  };

  const handleSelectMasterAttr = (attrId: string) => {
    setSelectedAttrId(attrId);
    if (!attrId) {
      setAttrKey("");
      setPresetValues([]);
      return;
    }
    const found = masterAttributes.find((a) => a.id === attrId);
    if (found) {
      setAttrKey(found.name);
      const vals = found.values ? found.values.map((v: any) => v.value) : [];
      setPresetValues(vals);
      if (vals.length > 0) {
        setAttrValue(vals[0]);
      } else {
        setAttrValue("");
      }
    }
  };

  const fetchOptions = async () => {
    try {
      const [bRes, cRes, sRes] = await Promise.all([
        fetch("/api/brands"),
        fetch("/api/categories"),
        fetch("/api/suppliers"),
      ]);

      const bJson = await bRes.json();
      const cJson = await cRes.json();
      const sJson = await sRes.json();

      const bList = Array.isArray(bJson) ? bJson : (bJson.data ?? []);
      const cList = Array.isArray(cJson) ? cJson : (cJson.data ?? []);
      const sList = Array.isArray(sJson) ? sJson : (sJson.data ?? []);

      setBrands(bList);
      setCategories(cList);
      setSuppliers(sList);

      if (bList.length > 0 && !product.brandId) {
        setProduct((prev) => ({ ...prev, brandId: bList[0].id, brand: bList[0].name }));
      }
      if (cList.length > 0 && !product.categoryId) {
        setProduct((prev) => ({ ...prev, categoryId: cList[0].id, category: cList[0].name }));
      }
      if (sList.length > 0 && !product.supplierId) {
        setProduct((prev) => ({ ...prev, supplierId: sList[0].id, supplier: sList[0].name }));
      }
    } catch (err) {
      console.error("Failed to fetch dropdown options:", err);
    }
  };

  const costPrice = Number(product.costPrice || 0);
  const sellingPrice = Number(product.price || 0);
  const profit = sellingPrice - costPrice;
  const marginPercent = sellingPrice > 0 ? ((profit / sellingPrice) * 100).toFixed(1) : "0.0";

  const channelsList = [
    { id: "web", name: "Online Web Store", icon: Globe, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { id: "amazon", name: "Amazon Marketplace", icon: PackageCheck, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { id: "pos", name: "Retail POS Store", icon: Store, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  ];

  const currentChannels = product.publishedChannels || ["web", "amazon", "pos"];

  const toggleChannel = (channelId: string) => {
    const updated = currentChannels.includes(channelId)
      ? currentChannels.filter((c) => c !== channelId)
      : [...currentChannels, channelId];

    setProduct({
      ...product,
      publishedChannels: updated,
    });
  };

  const handleAddAttribute = () => {
    if (!attrKey.trim() || !attrValue.trim()) return;
    const newAttr: ProductAttribute = { key: attrKey.trim(), value: attrValue.trim() };
    const updatedAttrs = [...(product.attributes || []), newAttr];
    setProduct({ ...product, attributes: updatedAttrs });
    setAttrKey("");
    setAttrValue("");
  };

  const handleRemoveAttribute = (index: number) => {
    const updatedAttrs = (product.attributes || []).filter((_, idx) => idx !== index);
    setProduct({ ...product, attributes: updatedAttrs });
  };

  async function handleGenerate() {
    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product,
        }),
      });

      const data = await response.json();
      if (setCatalog) {
        setCatalog(data.catalog);
      }
    } catch (error) {
      console.error("Failed to generate catalog:", error);
    } finally {
      setLoading(false);
    }
  }

  const [activeSection, setActiveSection] = useState<"IDENTITY" | "COMMERCIAL" | "PHYSICAL" | "ATTRIBUTES" | "DESCRIPTION">("IDENTITY");

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-7 space-y-6">
      {/* Section Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-4 text-xs font-bold">
        {[
          { id: "IDENTITY", label: "🏷️ Identity" },
          { id: "COMMERCIAL", label: "💰 Commercial & Margin" },
          { id: "PHYSICAL", label: "📦 Physical Specs" },
          { id: "ATTRIBUTES", label: "🎛️ Master Attributes" },
          { id: "DESCRIPTION", label: "📝 Description" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id as any)}
            className={`rounded-xl px-3.5 py-2 transition-all cursor-pointer ${
              activeSection === tab.id
                ? "bg-slate-950 text-white font-extrabold shadow-2xs"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* SECTION 1: IDENTITY */}
        {activeSection === "IDENTITY" && (
          <div className="space-y-4">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <span>🏷️ Immutable Product Identity</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="productName">
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="productName"
                  placeholder="e.g. Ergonomic Wireless Gaming Mouse"
                  value={product.name}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="sku">SKU Code <span className="text-red-500">*</span></Label>
                <Input
                  id="sku"
                  placeholder="e.g. WM-LOGI-001"
                  value={product.sku}
                  onChange={(e) => setProduct({ ...product, sku: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="brandSelect" className="flex items-center gap-1">
                  <Shapes className="h-3.5 w-3.5 text-slate-500" />
                  <span>Brand <span className="text-red-500">*</span></span>
                </Label>
                <select
                  id="brandSelect"
                  value={product.brandId || ""}
                  onChange={(e) => {
                    const selected = brands.find((b) => b.id === e.target.value);
                    setProduct({ ...product, brandId: e.target.value, brand: selected?.name || "" });
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:border-indigo-600 focus:outline-hidden shadow-2xs"
                >
                  <option value="">-- Select Brand --</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="categorySelect" className="flex items-center gap-1">
                  <Tags className="h-3.5 w-3.5 text-slate-500" />
                  <span>Category <span className="text-red-500">*</span></span>
                </Label>
                <select
                  id="categorySelect"
                  value={product.categoryId || ""}
                  onChange={(e) => {
                    const selected = categories.find((c) => c.id === e.target.value);
                    setProduct({ ...product, categoryId: e.target.value, category: selected?.name || "" });
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:border-indigo-600 focus:outline-hidden shadow-2xs"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="supplierSelect" className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-slate-500" />
                  <span>Supplier Vendor <span className="text-red-500">*</span></span>
                </Label>
                <select
                  id="supplierSelect"
                  value={product.supplierId || ""}
                  onChange={(e) => {
                    const selected = suppliers.find((s) => s.id === e.target.value);
                    setProduct({ ...product, supplierId: e.target.value, supplier: selected?.name || "" });
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:border-indigo-600 focus:outline-hidden shadow-2xs"
                >
                  <option value="">-- Select Supplier --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.code ? `(${s.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: COMMERCIAL */}
        {activeSection === "COMMERCIAL" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-indigo-600" /> Commercial & Margin Intelligence
              </span>
              {sellingPrice > 0 && costPrice > 0 && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
                    profit > 0
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>
                    {profit > 0 ? `🔥 ${marginPercent}% Margin ($${profit.toFixed(2)} profit)` : `⚠️ ${marginPercent}% Margin`}
                  </span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="costPrice">Cost Price ($)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  placeholder="10.00"
                  value={product.costPrice || ""}
                  onChange={(e) => setProduct({ ...product, costPrice: Number(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="price">Selling Price ($) <span className="text-red-500">*</span></Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="29.99"
                  value={product.price || ""}
                  onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: PHYSICAL SPECS */}
        {activeSection === "PHYSICAL" && (
          <div className="space-y-4">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
              📦 Physical Specs & Package Dimensions
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <Label>Weight (kg / lbs)</Label>
                <Input placeholder="e.g. 0.45 kg" />
              </div>
              <div>
                <Label>Dimensions (L × W × H)</Label>
                <Input placeholder="e.g. 12 × 6 × 4 cm" />
              </div>
              <div>
                <Label>Volume / Storage Class</Label>
                <Input placeholder="e.g. Standard Parcel" />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: MASTER ATTRIBUTES */}
        {activeSection === "ATTRIBUTES" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-indigo-600" /> Master Attributes & Specifications
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Select defined master attribute or type custom</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <div className="sm:col-span-2">
                <select
                  value={selectedAttrId}
                  onChange={(e) => handleSelectMasterAttr(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:border-indigo-600 focus:outline-hidden shadow-2xs"
                >
                  <option value="">-- Choose Attribute --</option>
                  {masterAttributes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                {presetValues.length > 0 ? (
                  <select
                    value={attrValue}
                    onChange={(e) => setAttrValue(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:border-indigo-600 focus:outline-hidden shadow-2xs"
                  >
                    {presetValues.map((val) => (
                      <option key={val} value={val}>
                        {val}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Attribute Value (e.g. Space Gray)"
                    value={attrValue}
                    onChange={(e) => setAttrValue(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800 shadow-2xs focus:border-indigo-600 focus:outline-hidden"
                  />
                )}
              </div>

              <button
                type="button"
                onClick={handleAddAttribute}
                className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-950 px-3 py-2.5 text-xs font-bold text-white hover:bg-indigo-600 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Add</span>
              </button>
            </div>

            {product.attributes && product.attributes.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {product.attributes.map((attr, idx) => (
                  <div key={idx} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-2xs">
                    <span className="font-bold text-indigo-700">{attr.key}:</span>
                    <span>{attr.value}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttribute(idx)}
                      className="text-slate-400 hover:text-red-600 transition-colors ml-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 5: DESCRIPTION */}
        {activeSection === "DESCRIPTION" && (
          <div className="space-y-4">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
              📝 Detailed Copy & Specifications Notes
            </div>
            <div>
              <textarea
                id="description"
                placeholder="Enter detailed product description..."
                value={product.description}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-indigo-600 focus:outline-hidden shadow-2xs"
                rows={6}
              />
            </div>
          </div>
        )}
      </div>

      {showAiGenerate && handleGenerate && (
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all"
        >
          <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
          <span>{loading ? "Generating AI Catalog Copy..." : "✨ Generate AI Catalog Copy"}</span>
        </button>
      )}
    </div>
  );
}
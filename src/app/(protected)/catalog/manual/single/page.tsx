"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import ProductForm from "@/components/product/ProductForm";
import ProductPreview from "@/components/product/ProductPreview";
import { Product } from "@/types/product";
import { Copy, Save, Barcode } from "lucide-react";

export default function ManualSingleProductPage() {
  const router = useRouter();
  const [product, setProduct] = useState<any>({
    id: "temp-id",
    name: "",
    sku: "",
    brand: "",
    brandId: "",
    category: "",
    categoryId: "",
    supplier: "",
    supplierId: "",
    marketplace: "Web Store",
    price: 0,
    costPrice: 0,
    currentStock: 0,
    minStock: 0,
    status: "ACTIVE",
    description: "",
    attributes: [],
    publishedChannels: [],
  });

  const [catalog, setCatalog] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAutoGenerateSku = () => {
    const randomSku = "SKU-" + Math.floor(100000 + Math.random() * 900000);
    setProduct((prev: Product) => ({ ...prev, sku: randomSku }));
  };

  const handleDuplicateProduct = () => {
    setProduct((prev: Product) => ({
      ...prev,
      name: prev.name ? `${prev.name} (Copy)` : "New Product Copy",
      sku: "SKU-" + Math.floor(100000 + Math.random() * 900000),
    }));
    alert("Product duplicated for editing!");
  };

  const handleSaveToDatabase = async (statusOverride?: string) => {
    if (!product.name.trim()) {
      alert("Product Name is required!");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/inventory/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...product,
          status: statusOverride || product.status,
          sellingPrice: Number(product.price),
          costPrice: Number(product.costPrice),
          currentStock: Number(product.currentStock),
          minStock: Number(product.minStock),
        }),
      });

      const json = await res.json();
      if (json.success || res.ok) {
        alert(statusOverride === "DRAFT" ? "Saved to Workspace Drafts!" : "Product saved to Catalog!");
        router.push("/catalog/workspace");
      } else {
        alert(json.error || "Failed to save product.");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error saving product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <PageHero
        title="Manual Product Studio"
        description="Precision manual entry with SKU generator, barcode preview, gross margin tracking, and master attribute specifications."
        badge="100% User-Controlled"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoGenerateSku}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-400/30 bg-indigo-950/60 px-3.5 py-2 text-xs font-bold text-indigo-300 hover:bg-indigo-900/80 transition-all shadow-xs cursor-pointer"
            >
              <Barcode className="h-3.5 w-3.5 text-indigo-400" />
              <span>Auto SKU</span>
            </button>
            <button
              onClick={handleDuplicateProduct}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5 text-slate-400" />
              <span>Duplicate</span>
            </button>
            <button
              onClick={() => handleSaveToDatabase("DRAFT")}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Draft</span>
            </button>
          </div>
        }
      />

      {/* 2-Column Form & Live Card Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          <ProductForm
            product={product}
            setProduct={setProduct}
            setCatalog={setCatalog}
            showAiGenerate={false}
          />
        </div>

        <div className="lg:col-span-5 sticky top-24">
          <ProductPreview
            product={product}
            catalog={null}
            onSaveToDatabase={() => handleSaveToDatabase("ACTIVE")}
            saving={saving}
          />
        </div>
      </div>
    </div>
  );
}

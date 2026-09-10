import { useState } from "react";
import { Product } from "@/types/product";
import { Sparkles, Download, CheckCircle2, TrendingUp, DollarSign, Tag, Save, Sliders } from "lucide-react";
import { useRouter } from "next/navigation";

type Catalog = {
  title: string;
  description: string;
  features: string[];
  seoKeywords: string[];
};

type ProductPreviewProps = {
  product: Product;
  catalog: Catalog | null;
  onSaveToDatabase?: () => Promise<void>;
  saving?: boolean;
};

export default function ProductPreview({
  product,
  catalog,
  onSaveToDatabase,
  saving = false,
}: ProductPreviewProps) {
  const router = useRouter();
  const costPrice = Number(product.costPrice || 0);
  const sellingPrice = Number(product.price || 0);
  const profit = sellingPrice - costPrice;
  const marginPercent = sellingPrice > 0 ? ((profit / sellingPrice) * 100).toFixed(1) : "0.0";

  async function handleExport() {
    if (!catalog) return;

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product,
          catalog,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to export Excel");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Catalog_${product.name || "Product"}.xlsx`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Failed to export Excel.");
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 sticky top-20 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <span>Live Catalog Preview</span>
        </h2>
        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200/60">
          Live Render
        </span>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-5 space-y-5">
        {/* Product Image Box */}
        <div className="h-60 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center overflow-hidden shadow-2xs">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="max-h-full max-w-full object-contain p-2"
            />
          ) : (
            <div className="text-center p-6 text-slate-400">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-xs font-medium">Upload photo to preview listing</p>
            </div>
          )}
        </div>

        {/* Product Name & Brand Pill */}
        <div>
          {product.brand && (
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mb-1.5">
              {product.brand}
            </span>
          )}
          <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
            {catalog?.title || product.name || "Product Name Preview"}
          </h3>
        </div>

        {/* Price & Margin Pill */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Retail Price</div>
            <div className="text-2xl font-black text-indigo-600">
              ${sellingPrice.toFixed(2)}
            </div>
          </div>

          {sellingPrice > 0 && costPrice > 0 && (
            <div className="text-right">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold border ${
                profit > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
              }`}>
                <TrendingUp className="h-3 w-3" />
                <span>{profit > 0 ? `${marginPercent}% Margin` : `${marginPercent}% Margin`}</span>
              </span>
              <div className="text-[10px] text-slate-500 mt-0.5">+${profit.toFixed(2)} gross profit</div>
            </div>
          )}
        </div>

        {/* Product Description */}
        <p className="text-xs text-slate-600 leading-relaxed">
          {catalog?.description || product.description || "Product description copy will appear here once generated..."}
        </p>

        {/* AI Generated Features List */}
        {catalog && catalog.features && catalog.features.length > 0 && (
          <div className="rounded-xl border border-indigo-100 bg-white p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Key Features & Bullets
            </h4>

            <ul className="space-y-2 text-xs text-slate-700">
              {catalog.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-normal">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Custom Attributes & Specifications */}
        {product.attributes && product.attributes.length > 0 && (
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Sliders className="h-3 w-3 text-indigo-600" /> Specifications & Attributes
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {product.attributes.map((attr, idx) => (
                <div key={idx} className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{attr.key}</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{attr.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEO Keywords */}
        {catalog && catalog.seoKeywords && catalog.seoKeywords.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase text-slate-400">SEO Keywords</h4>
            <div className="flex flex-wrap gap-1.5">
              {catalog.seoKeywords.map((keyword, index) => (
                <span key={index} className="rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                  #{keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Database Save CTA */}
      {onSaveToDatabase && (
        <button
          onClick={onSaveToDatabase}
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 hover:bg-indigo-600 text-white py-3 text-sm font-extrabold shadow-lg shadow-slate-950/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? "Saving Product..." : "Save Product to Catalog"}</span>
        </button>
      )}

      {catalog && (
        <button
          onClick={handleExport}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <Download className="h-3.5 w-3.5 text-slate-600" />
          <span>Export Catalog to Excel</span>
        </button>
      )}
    </div>
  );
}
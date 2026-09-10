"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/product/ProductForm";
import ImageUploader from "@/components/product/ImageUploader";
import ProductPreview from "@/components/product/ProductPreview";
import { defaultProduct } from "@/lib/defaultProduct";
import { PageHero } from "@/components/layout/PageHero";
import { Product } from "@/types/product";

export default function NewProductPage() {
  const router = useRouter();
  const [product, setProduct] = useState<Product>(defaultProduct);
  const [catalog, setCatalog] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleSaveToDatabase = async () => {
    setSaveError("");
    if (!product.name) {
      setSaveError("Please enter a product name before saving.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/inventory/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: product.sku || `SKU-${Date.now().toString().slice(-6)}`,
          name: catalog?.title || product.name,
          description: catalog?.description || product.description || "",
          brandId: product.brandId || undefined,
          categoryId: product.categoryId || undefined,
          supplierId: product.supplierId || undefined,
          costPrice: Number(product.costPrice || 0),
          sellingPrice: Number(product.price || 0),
          currentStock: 50,
          minimumStock: 10,
          status: "ACTIVE",
        }),
      });

      const json = await res.json();
      if (json.success || res.ok) {
        router.push("/products");
        router.refresh();
      } else {
        setSaveError(json.message || "Failed to save product.");
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Network error saving product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHero
        title="AI Product Creation Studio"
        description="Enrich product specifications, calculate gross margins, upload high-res media, and generate AI-optimized multi-channel copy."
      />

      {saveError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600 shadow-2xs">
          ⚠️ {saveError}
        </div>
      )}

      {/* 2-Column Executive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form & Image Uploader */}
        <div className="lg:col-span-7 space-y-6">
          <ProductForm
            product={product}
            setProduct={setProduct}
            setCatalog={setCatalog}
          />

          <ImageUploader
            product={product}
            setProduct={setProduct}
          />
        </div>

        {/* Right Column: Live Render Preview Card */}
        <div className="lg:col-span-5">
          <ProductPreview
            product={product}
            catalog={catalog}
            onSaveToDatabase={handleSaveToDatabase}
            saving={saving}
          />
        </div>
      </div>
    </div>
  );
}
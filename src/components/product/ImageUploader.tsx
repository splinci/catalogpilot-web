"use client";

import { Product } from "@/types/product";
import { UploadCloud, Image as ImageIcon, Sparkles } from "lucide-react";

type ImageUploaderProps = {
  product: Product;
  setProduct: React.Dispatch<React.SetStateAction<Product>>;
};

export default function ImageUploader({
  product,
  setProduct,
}: ImageUploaderProps) {
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setProduct({
      ...product,
      image: imageUrl,
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-indigo-600" />
          <span>Product Media & Assets</span>
        </h3>
        <span className="text-xs text-slate-400">PNG, JPG, WEBP (Max 10MB)</span>
      </div>

      <label className="flex h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300/80 bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-400 transition-all group">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />

        <div className="text-center p-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform mb-3 shadow-2xs">
            <UploadCloud className="h-6 w-6 text-indigo-600" />
          </div>

          <p className="text-sm font-bold text-slate-800">
            Click to upload product image
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Drag and drop high-res photo for multi-channel listings
          </p>
        </div>
      </label>
    </div>
  );
}
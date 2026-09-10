"use client";

import { useEffect, useState } from "react";
import { PreviewProduct } from "@/types/preview";

type Props = {
  product: PreviewProduct;
};

export default function PreviewCard({
  product,
}: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!product.uploadedFile) {
      setImageUrl(null);
      return;
    }

    const url = URL.createObjectURL(product.uploadedFile);

    setImageUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [product.uploadedFile]);

  const marketplaceStyles: Record<string, string> = {
    Amazon: "bg-yellow-100 text-yellow-800",
    Flipkart: "bg-blue-100 text-blue-800",
    Myntra: "bg-pink-100 text-pink-700",
    Meesho: "bg-purple-100 text-purple-700",
  };

  const marketplaceBadge =
    marketplaceStyles[product.marketplace] ??
    "bg-gray-100 text-gray-700";

  return (
    <div
      className="
        overflow-hidden
        rounded-xl
        border
        border-gray-200
        bg-white
        shadow
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-blue-400
        hover:shadow-xl
      "
    >
      {/* Product Image */}

      <div className="flex h-48 items-center justify-center bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain p-6"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">
            📦
          </div>
        )}
      </div>

      {/* Divider */}

      <div className="border-t border-gray-100" />

      {/* Product Details */}

      <div className="space-y-5 p-5">

        {/* Product Name */}

        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {product.name}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {product.brand}
          </p>
        </div>

        {/* Product Information */}

        <div className="grid grid-cols-2 gap-y-3 text-sm">

          <span className="font-medium text-gray-500">
            SKU
          </span>

          <span className="font-semibold text-gray-900">
            {product.sku}
          </span>

          <span className="font-medium text-gray-500">
            Category
          </span>

          <span className="font-semibold text-gray-900">
            {product.category}
          </span>

          <span className="font-medium text-gray-500">
            Marketplace
          </span>

          <span>
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${marketplaceBadge}`}
            >
              {product.marketplace}
            </span>
          </span>

          <span className="font-medium text-gray-500">
            Price
          </span>

          <span className="font-semibold text-green-600">
            ₹
            {product.price.toLocaleString("en-IN", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
          </span>

        </div>

        {/* Status */}

        <div className="pt-2">
          {product.status === "matched" ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Ready
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Missing Image
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
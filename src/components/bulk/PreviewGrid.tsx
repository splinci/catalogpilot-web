"use client";

import { PreviewProduct } from "@/types/preview";
import PreviewCard from "./PreviewCard";

type Props = {
  products: PreviewProduct[];
};

export default function PreviewGrid({
  products,
}: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <PreviewCard
          key={product.sku}
          product={product}
        />
      ))}
    </div>
  );
}
"use client";

import { BulkProduct, ValidationResult } from "@/types/bulk";

import { buildPreviewProducts } from "@/lib/preview/buildPreviewProducts";

import PreviewHeader from "../PreviewHeader";
import PreviewGrid from "../PreviewGrid";
import GenerateSection from "../GenerateSection";

type Props = {
  currentStep: number;

  products: BulkProduct[];

  validationResult: ValidationResult | null;

  onGenerate: () => void;

  generating: boolean;
};

export default function Step4Preview({
  currentStep,
  products,
  validationResult,
  onGenerate,
  generating,
}: Props) {
  if (currentStep !== 4) {
    return null;
  }

  if (!validationResult) {
    return null;
  }

  const previewProducts = buildPreviewProducts(
    products,
    validationResult
  );

  return (
    <div className="space-y-8">
      <PreviewHeader
        totalProducts={previewProducts.length}
      />

      <PreviewGrid
        products={previewProducts}
      />

      <GenerateSection
        totalProducts={previewProducts.length}
        onGenerate={onGenerate}
        generating={generating}
      />
    </div>
  );
}
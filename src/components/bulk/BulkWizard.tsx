"use client";

import { useState } from "react";

import BulkStepper from "./BulkStepper";

import Step1Excel from "./steps/Step1Excel";
import Step2Images from "./steps/Step2Images";
import Step3Validation from "./steps/Step3Validation";
import Step4Preview from "./steps/Step4Preview";
import Step5Generate from "./steps/Step5Generate";

import { BulkProduct, ValidationResult } from "@/types/bulk";
import { validateMatches } from "@/lib/validation/validateMatches";
import { bulkGenerate } from "@/services/ai/bulkGenerate";
import type { GeneratedCatalog } from "@/services/ai/types";
import { buildPreviewProducts } from "@/lib/preview/buildPreviewProducts";

export default function BulkWizard() {
  const [products, setProducts] = useState<BulkProduct[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [excelFileName, setExcelFileName] = useState("");

  const [currentStep, setCurrentStep] = useState(1);

  const [validating, setValidating] = useState(false);

  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
    const [generating, setGenerating] =
    useState(false);
    
    const [generatedCatalogs, setGeneratedCatalogs] =
      useState<GeneratedCatalog[]>([]);

  // =========================
  // Excel Uploaded
  // =========================

  const handleProductsLoaded = (
    items: BulkProduct[],
    fileName: string
  ) => {
    setProducts(items);
    setExcelFileName(fileName);

    setImages([]);
    setValidationResult(null);

    setCurrentStep(2);
  };

  // =========================
  // Images Uploaded
  // =========================

  const handleImagesLoaded = (files: File[]) => {
    setImages(files);

    setValidationResult(null);

    setCurrentStep(3);
  };

  // =========================
  // Replace Excel
  // =========================

  const handleReplaceExcel = () => {
    setProducts([]);
    setImages([]);

    setExcelFileName("");

    setValidationResult(null);

    setCurrentStep(1);
  };

  // =========================
  // Replace Images
  // =========================

  const handleReplaceImages = () => {
    setImages([]);

    setValidationResult(null);

    setCurrentStep(2);
  };

  // =========================
  // Validate
  // =========================

  const handleValidate = async () => {
    setValidating(true);

    try {
      const result = validateMatches(products, images);

      setValidationResult(result);

    } finally {
      setValidating(false);
    }
  };

  const handleGenerate = async () => {
    if (!validationResult) return;
  
    setGenerating(true);
  
    try {
      const previewProducts = buildPreviewProducts(
        products,
        validationResult
      );
  
      const result = await bulkGenerate(previewProducts);
  
      setGeneratedCatalogs(result.success);
  
      setCurrentStep(5);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8">

      <BulkStepper currentStep={currentStep} />

      <Step1Excel
        currentStep={currentStep}
        products={products}
        excelFileName={excelFileName}
        onProductsLoaded={handleProductsLoaded}
        onReplaceExcel={handleReplaceExcel}
      />

      <Step2Images
        currentStep={currentStep}
        products={products}
        images={images}
        onImagesLoaded={handleImagesLoaded}
        onReplaceImages={handleReplaceImages}
      />

<Step3Validation
  currentStep={currentStep}
  loading={validating}
  validationResult={validationResult}
  onValidate={handleValidate}
  onContinue={() => setCurrentStep(4)}
/>

<Step4Preview
  currentStep={currentStep}
  products={products}
  validationResult={validationResult}
  onGenerate={handleGenerate}
  generating={generating}
/>

<Step5Generate
  currentStep={currentStep}
  generatedCatalogs={generatedCatalogs}
/>

    </div>
  );
}
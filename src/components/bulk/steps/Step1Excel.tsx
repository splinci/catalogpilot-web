"use client";

import { BulkProduct } from "@/types/bulk";
import ExcelUploader from "../ExcelUploader";
import CompletedExcelCard from "../CompletedExcelCard";

type Props = {
  currentStep: number;
  products: BulkProduct[];
  excelFileName: string;

  onProductsLoaded: (
    products: BulkProduct[],
    fileName: string
  ) => void;

  onReplaceExcel: () => void;
};

export default function Step1Excel({
  currentStep,
  products,
  excelFileName,
  onProductsLoaded,
  onReplaceExcel,
}: Props) {
  if (currentStep === 1) {
    return (
      <ExcelUploader
        onProductsLoaded={onProductsLoaded}
      />
    );
  }

  return (
    <CompletedExcelCard
      fileName={excelFileName}
      productCount={products.length}
      onReplace={onReplaceExcel}
    />
  );
}
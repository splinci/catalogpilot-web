"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { parseExcel } from "@/lib/excel/parser";
import { BulkProduct } from "@/types/bulk";

type ExcelUploaderProps = {
  onProductsLoaded: (
    products: BulkProduct[],
    fileName: string
  ) => void;
};

export default function ExcelUploader({
  onProductsLoaded,
}: ExcelUploaderProps) {
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [productCount, setProductCount] = useState(0);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;

      const file = acceptedFiles[0];

      setLoading(true);

      try {
        const products = await parseExcel(file);

        setFileName(file.name);
        setProductCount(products.length);

        onProductsLoaded(products, file.name);
      } catch (error) {
        console.error(error);
        alert("Failed to read Excel file.");
      } finally {
        setLoading(false);
      }
    },
    [onProductsLoaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    multiple: false,
    onDrop,
  });

  return (
    <div className="rounded-xl bg-white p-8 shadow">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Step 1 · Upload Excel
      </h2>

      <div
        {...getRootProps()}
        className={`
          cursor-pointer
          rounded-xl
          border-2
          border-dashed
          p-12
          text-center
          transition

          ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400"
          }
        `}
      >
        <input {...getInputProps()} />

        <div className="text-6xl">📄</div>

        <h3 className="mt-6 text-xl font-semibold">
          {isDragActive
            ? "Drop your Excel file here"
            : "Drag & Drop Excel File"}
        </h3>

        <p className="mt-3 text-gray-500">
          or click to browse
        </p>

        <p className="mt-6 text-sm text-gray-400">
          Supported format: .xlsx
        </p>
      </div>

      {loading && (
        <div className="mt-6 rounded-lg bg-blue-50 p-4 text-blue-700">
          Reading Excel...
        </div>
      )}

      {fileName && (
        <div className="mt-6 rounded-lg border bg-green-50 p-5">
          <p className="font-semibold text-green-700">
            ✅ {fileName}
          </p>

          <p className="mt-2 text-gray-700">
            {productCount} products loaded.
          </p>
        </div>
      )}
    </div>
  );
}
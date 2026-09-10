"use client";

import { GeneratedCatalog } from "@/services/ai/types";
import { exportCatalogExcel } from "@/lib/export/exportExcel";


type Props = {
  currentStep: number;
  generatedCatalogs: GeneratedCatalog[];
};

export default function Step5Generate({
  currentStep,
  generatedCatalogs,
}: Props) {
  if (currentStep !== 5) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-white p-8 shadow">
        <h2 className="text-3xl font-bold text-gray-900">
          🎉 AI Catalog Generated
        </h2>

        <p className="mt-2 text-gray-600">
          Atlas successfully generated AI content for{" "}
          <span className="font-semibold">
            {generatedCatalogs.length}
          </span>{" "}
          products.
        </p>
      </div>
      <div className="flex justify-end">
  <button
    onClick={() =>
      exportCatalogExcel(generatedCatalogs)
    }
    className="
      rounded-lg
      bg-green-600
      px-6
      py-3
      font-semibold
      text-white
      hover:bg-green-700
    "
  >
    📥 Export Excel
  </button>
</div>

      {generatedCatalogs.map((item) => (
        <div
          key={item.product.sku}
          className="rounded-xl bg-white p-8 shadow"
        >
          <div className="border-b pb-4">
            <h3 className="text-2xl font-bold">
              {item.product.name}
            </h3>

            <p className="text-gray-500">
              {item.product.brand}
            </p>

            <p className="mt-2 text-sm text-gray-400">
              SKU: {item.product.sku}
            </p>
          </div>

          <div className="mt-6 space-y-6">
            <div>
              <h4 className="font-semibold text-lg">
                SEO Title
              </h4>

              <p className="mt-2">
                {item.catalog.title}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg">
                Description
              </h4>

              <p className="mt-2 whitespace-pre-line">
                {item.catalog.description}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg">
                Features
              </h4>

              <ul className="mt-2 list-disc space-y-1 pl-6">
                {item.catalog.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg">
                SEO Keywords
              </h4>

              <div className="mt-3 flex flex-wrap gap-2">
                {item.catalog.seoKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
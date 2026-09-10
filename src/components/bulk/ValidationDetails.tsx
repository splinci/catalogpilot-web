"use client";

import { ValidationResult } from "@/types/bulk";

type Props = {
  result: ValidationResult;
};

export default function ValidationDetails({ result }: Props) {
  return (
    <div className="rounded-xl bg-white p-8 shadow">

      <h2 className="text-2xl font-bold">
        Product Validation Details
      </h2>

      <p className="mt-2 text-gray-500">
        Review every product before continuing.
      </p>

      <div className="mt-8 overflow-x-auto">

        <table className="min-w-full border border-gray-200">

          <thead className="bg-gray-100">

            <tr>

              <th className="border px-4 py-3 text-left">
                SKU
              </th>

              <th className="border px-4 py-3 text-left">
                Product
              </th>

              <th className="border px-4 py-3 text-left">
                Expected Image
              </th>

              <th className="border px-4 py-3 text-left">
                Uploaded Image
              </th>

              <th className="border px-4 py-3 text-center">
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            {result.items.map((item) => (

              <tr key={item.sku}>

                <td className="border px-4 py-3">
                  {item.sku}
                </td>

                <td className="border px-4 py-3">
                  {item.productName}
                </td>

                <td className="border px-4 py-3">
                  {item.expectedImage}
                </td>

                <td className="border px-4 py-3">
                  {item.uploadedImage ?? "-"}
                </td>

                <td className="border px-4 py-3 text-center">

                  {item.status === "matched" ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                      ✅ Matched
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                      ❌ Missing
                    </span>
                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}
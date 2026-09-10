"use client";

import { ValidationResult } from "@/types/bulk";

type Props = {
  result: ValidationResult;
  onContinue?: () => void;
};

export default function ValidationSummary({
  result,
  onContinue,
}: Props) {
  return (
    <div className="rounded-xl bg-white p-8 shadow">

      <h2 className="text-2xl font-bold">
        Validation Results
      </h2>

      <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3">

        <div>
          <p className="text-sm text-gray-500">
            Products
          </p>

          <p className="text-3xl font-bold">
            {result.totalProducts}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Images
          </p>

          <p className="text-3xl font-bold">
            {result.totalImages}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Matched
          </p>

          <p className="text-3xl font-bold text-green-600">
            {result.matched}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Missing
          </p>

          <p className="text-3xl font-bold text-red-600">
            {result.missing}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Duplicates
          </p>

          <p className="text-3xl font-bold text-yellow-600">
            {result.duplicate}
          </p>
        </div>

      </div>

      {/* Status */}

      <div className="mt-8 rounded-lg border bg-green-50
border-green-200
text-green-700 p-6">

        <h3 className="font-semibold">
          Status
        </h3>

        {result.isValid ? (
          <>
            <p className="mt-3 text-lg font-bold text-green-600">
              🟢 Ready for Preview
            </p>

            <p className="mt-2 text-gray-600">
              Everything looks good! You can continue to preview your products.
            </p>

            {onContinue && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={onContinue}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Continue to Preview →
                </button>
              </div>
            )}

          </>
        ) : (
          <>
            <p className="mt-3 text-lg font-bold text-red-600">
              ❌ Validation Failed
            </p>

            <p className="mt-2 text-gray-600">
              Please fix the missing or invalid products before continuing.
            </p>
          </>
        )}

      </div>

    </div>
  );
}
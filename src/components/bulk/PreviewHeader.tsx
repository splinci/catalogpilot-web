"use client";

type PreviewHeaderProps = {
  totalProducts: number;
};

export default function PreviewHeader({
  totalProducts,
}: PreviewHeaderProps) {
  return (
    <div className="rounded-xl bg-white p-8 shadow">

      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

        <div>
          <h2 className="text-3xl font-bold">
            Step 4 · Preview Products
          </h2>

          <p className="mt-2 text-gray-500">
            Review your products before generating AI catalogs.
          </p>
        </div>

        <div className="flex gap-6">

          <div className="rounded-lg bg-blue-50 px-6 py-4 text-center">
            <p className="text-sm text-gray-500">
              Products
            </p>

            <p className="text-3xl font-bold text-blue-600">
              {totalProducts}
            </p>
          </div>

          <div className="rounded-lg bg-green-50 px-6 py-4 text-center">
            <p className="text-sm text-gray-500">
              Status
            </p>

            <p className="font-bold text-green-600">
              Ready
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
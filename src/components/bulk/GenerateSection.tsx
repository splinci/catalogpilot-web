"use client";

type Props = {
  totalProducts: number;
  onGenerate: () => void;
  generating?: boolean;
};

export default function GenerateSection({
  totalProducts,
  onGenerate,
  generating = false,
}: Props) {
  return (
    <div className="rounded-xl bg-white p-8 shadow">

      <h2 className="text-2xl font-bold">
        Ready for AI Generation
      </h2>

      <p className="mt-2 text-gray-600">
        Splinci AI is ready to generate AI-powered catalog content.
      </p>

      <div className="mt-8 grid grid-cols-3 gap-6">
        <div>
          <p className="text-sm text-gray-500">Products</p>
          <p className="text-3xl font-bold">
            {totalProducts}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Estimated Time
          </p>
          <p className="text-3xl font-bold text-blue-600">
            {totalProducts * 5} sec
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Cost</p>
          <p className="text-3xl font-bold text-green-600">
            Free
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onGenerate}
          disabled={generating}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {generating
            ? "Generating..."
            : "🚀 Generate AI Catalog"}
        </button>
      </div>
    </div>
  );
}
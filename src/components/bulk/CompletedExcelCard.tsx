"use client";

type CompletedExcelCardProps = {
  fileName: string;
  productCount: number;
  onReplace: () => void;
};

export default function CompletedExcelCard({
  fileName,
  productCount,
  onReplace,
}: CompletedExcelCardProps) {
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-6 shadow">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-green-700">
            ✅ Step 1 Completed
          </h2>

          <p className="mt-3 text-gray-700">
  📄 <span className="font-medium">{fileName}</span>
</p>

          <p className="mt-1 text-gray-700">
            <span className="font-semibold">Products:</span> {productCount}
          </p>
        </div>

        <button
          onClick={onReplace}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Replace Excel
        </button>
      </div>
    </div>
  );
}
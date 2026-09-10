"use client";

type CompletedImagesCardProps = {
  imageCount: number;
  onReplace: () => void;
};

export default function CompletedImagesCard({
  imageCount,
  onReplace,
}: CompletedImagesCardProps) {
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-6 shadow">
      <div className="flex items-start justify-between">

        <div>
          <h2 className="text-xl font-bold text-green-700">
            ✅ Step 2 Completed
          </h2>

          <p className="mt-3 text-gray-700">
            🖼 {imageCount} image(s) uploaded
          </p>

          <p className="mt-1 text-green-700 font-medium">
            Ready for Validation
          </p>
        </div>

        <button
          onClick={onReplace}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Replace Images
        </button>

      </div>
    </div>
  );
}
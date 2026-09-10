"use client";

type ValidationCardProps = {
  onValidate: () => void;
  loading: boolean;
};

export default function ValidationCard({
  onValidate,
  loading,
}: ValidationCardProps) {
  return (
    <div className="rounded-xl bg-white p-8 shadow">

      <h2 className="text-2xl font-bold text-gray-900">
        Step 3 • Validate Products
      </h2>

      <p className="mt-3 text-gray-600">
        Before generating AI catalogs, Atlas will verify your uploaded
        products and images.
      </p>

      <div className="mt-8 rounded-lg border bg-slate-50 p-6">

        <h3 className="font-semibold text-gray-800">
          Validation Checklist
        </h3>

        <ul className="mt-5 space-y-4">

          <li className="flex items-center gap-3">
            <span>✅</span>
            <span>Required product fields</span>
          </li>

          <li className="flex items-center gap-3">
            <span>✅</span>
            <span>Duplicate SKU detection</span>
          </li>

          <li className="flex items-center gap-3">
            <span>✅</span>
            <span>Duplicate image detection</span>
          </li>

          <li className="flex items-center gap-3">
            <span>✅</span>
            <span>Missing images</span>
          </li>

          <li className="flex items-center gap-3">
            <span>✅</span>
            <span>Product ↔ Image matching</span>
          </li>

        </ul>

      </div>

      <div className="mt-8">

        <button
          onClick={onValidate}
          disabled={loading}
          className="
            rounded-lg
            bg-blue-600
            px-6
            py-3
            font-semibold
            text-white
            transition
            hover:bg-blue-700
            disabled:cursor-not-allowed
            disabled:bg-gray-400
          "
        >
          {loading
            ? "Validating..."
            : "Validate Products"}
        </button>

      </div>

    </div>
  );
}
import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-lg rounded-xl bg-white p-10 text-center shadow-lg">
        <div className="mb-6 text-7xl">🚫</div>

        <h1 className="mb-2 text-3xl font-bold">
          Access Denied
        </h1>

        <p className="mb-8 text-gray-600">
          You don't have permission to access this page.
        </p>

        <Link
          href="/"
          className="inline-flex rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
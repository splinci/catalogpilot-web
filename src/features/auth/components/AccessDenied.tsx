import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-20">

      <div className="text-6xl">
        🚫
      </div>

      <h2 className="mt-6 text-2xl font-bold">
        Access Denied
      </h2>

      <p className="mt-2 text-muted-foreground">
        You don't have permission to view this page.
      </p>

      <Link
        href="/"
        className="mt-8 rounded-lg bg-primary px-6 py-3 text-primary-foreground"
      >
        Return to Dashboard
      </Link>

    </div>
  );
}
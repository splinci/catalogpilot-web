import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const version = process.env.APP_VERSION || "1.0.0";
  const environment = process.env.NODE_ENV || "development";
  const release =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    "unknown";

  return NextResponse.json(
    {
      success: true,
      version,
      environment,
      release,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

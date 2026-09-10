import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      status: "live",
      liveness: true,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

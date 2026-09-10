import { NextRequest, NextResponse } from "next/server";
import { authenticationService } from "@/services/auth.service";
import { getCurrentSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";

    if (session) {
      await authenticationService.logout(session, ipAddress);
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "Logged out successfully",
        redirectUrl: "/login",
      },
      { status: 200 }
    );

    // Clear session cookies server-side
    response.cookies.set("atlas_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    response.cookies.set("atlas_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error: any) {
    const response = NextResponse.json(
      {
        success: false,
        message: error.message || "Logout failed",
      },
      { status: 500 }
    );

    response.cookies.set("atlas_session", "", { maxAge: 0, path: "/" });
    response.cookies.set("atlas_token", "", { maxAge: 0, path: "/" });
    return response;
  }
}
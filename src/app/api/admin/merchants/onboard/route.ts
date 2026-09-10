import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { merchantOnboardingService } from "@/services/onboarding/merchant-onboarding.service";
import { authorizationService } from "@/services/authorization.service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // 1. Session Authentication
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Session missing or expired" },
        { status: 401 }
      );
    }

    // 2. Server-Side Platform Admin Authorization Enforcement
    const isPlatformAdmin = authorizationService.isPlatformAdmin(session);
    if (!isPlatformAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only Splinci Platform Administrators can onboard new merchant tenants." },
        { status: 403 }
      );
    }

    // 3. Payload Parsing
    const body = await req.json().catch(() => ({}));

    // 4. Provisioning Service Invocation
    const result = await merchantOnboardingService.onboardMerchant(body, session);

    if (!result.success) {
      const statusCode = result.error?.startsWith("Service Unavailable") ? 503 : 400;
      return NextResponse.json(
        { success: false, error: result.error, data: result.data },
        { status: statusCode }
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

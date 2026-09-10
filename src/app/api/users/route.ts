import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { UserManagementService } from "@/services/auth/user-management.service";

export const runtime = "nodejs";

const userManagementService = new UserManagementService();

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Session missing or expired" },
        { status: 401 }
      );
    }

    const isPlatformAdmin = authorizationService.isPlatformAdmin(session);
    const users = isPlatformAdmin
      ? await userManagementService.getUsers()
      : await userManagementService.getUsersByCompanyId(session.companyId);

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to load users.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Session missing or expired" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const isPlatformAdmin = authorizationService.isPlatformAdmin(session);
    const targetCompanyId = isPlatformAdmin && body.companyId ? body.companyId : session.companyId;

    const result = await userManagementService.createUser(
      {
        companyId: targetCompanyId,
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
      },
      body.roleId
    );

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to create user.",
      },
      {
        status: 400,
      }
    );
  }
}
import { NextResponse } from "next/server";

import { RoleService } from "@/services/auth/role.service";

const roleService = new RoleService();

export async function GET() {
  try {
    const roles = await roleService.getRoles();

    return NextResponse.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load roles.",
      },
      {
        status: 500,
      }
    );
  }
}
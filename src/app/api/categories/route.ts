import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { requirePermission, PERMISSIONS } from "@/lib/auth/permissions";
import { categoryService } from "@/domains/category/services/category.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getCurrentSession();
    const auth = requirePermission(session, PERMISSIONS.CATALOG_READ);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: session ? 403 : 401 });
    }

    const categories = await categoryService.findAll(session!.companyId);

    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.message || "Failed to load categories.",
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
    const auth = requirePermission(session, PERMISSIONS.CATEGORIES_MANAGE);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: session ? 403 : 401 });
    }

    const body = await request.json();
    const category = await categoryService.create(session!.companyId, body);

    return NextResponse.json(category, {
      status: 201,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to create category.",
      },
      {
        status: 400,
      }
    );
  }
}
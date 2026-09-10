import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { requirePermission, PERMISSIONS } from "@/lib/auth/permissions";
import { brandService } from "@/domains/brand/services/brand.service";
import { createBrandSchema } from "@/domains/brand/schemas/create-brand.schema";
import { handleApiError } from "@/lib/api/handleApiError";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getCurrentSession();
    const auth = requirePermission(session, PERMISSIONS.CATALOG_READ);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: session ? 403 : 401 });
    }

    const brands = await brandService.getBrands(session!.companyId);

    return NextResponse.json(brands);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    const auth = requirePermission(session, PERMISSIONS.BRANDS_MANAGE);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: session ? 403 : 401 });
    }

    const body = createBrandSchema.parse(await request.json());

    const brand = await brandService.createBrand(session!.companyId, body);

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
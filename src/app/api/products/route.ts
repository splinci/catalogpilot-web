import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { requirePermission, PERMISSIONS } from "@/lib/auth/permissions";
import { productService } from "@/domains/product/services/productService";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    const auth = requirePermission(session, PERMISSIONS.CATALOG_READ);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: session ? 403 : 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? undefined;

    const products = await productService.getProducts(session!.companyId, { search });
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || "Failed to fetch products." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    const auth = requirePermission(session, PERMISSIONS.CATALOG_CREATE);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: session ? 403 : 401 });
    }

    const body = await request.json();
    const product = await productService.createProduct(session!.companyId, body);

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ message: error?.message || "Failed to create product." }, { status: 500 });
  }
}
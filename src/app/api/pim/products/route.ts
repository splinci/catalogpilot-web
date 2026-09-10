import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { productService } from "@/services/product.service";
import { CreateProductSchema, ProductQuerySchema } from "@/types/pim.dto";
import { authorizationService } from "@/services/authorization.service";

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "products:read")) {
      return NextResponse.json({ success: false, error: "Forbidden: Missing products:read permission" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = ProductQuerySchema.parse(Object.fromEntries(searchParams));

    const result = await productService.listProducts(session, query);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch products" }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "products:write")) {
      return NextResponse.json({ success: false, error: "Forbidden: Missing products:write permission" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = CreateProductSchema.parse(body);

    const product = await productService.createProduct(session, validatedData);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to create product" }, { status: 400 });
  }
}

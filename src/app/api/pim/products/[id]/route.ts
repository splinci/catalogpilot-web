import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { productService } from "@/services/product.service";
import { UpdateProductSchema } from "@/types/pim.dto";
import { authorizationService } from "@/services/authorization.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "products:read")) {
      return NextResponse.json({ success: false, error: "Forbidden: Missing products:read permission" }, { status: 403 });
    }

    const { id } = await params;
    const product = await productService.getProductById(session, id);
    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Product not found" }, { status: 404 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "products:write")) {
      return NextResponse.json({ success: false, error: "Forbidden: Missing products:write permission" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = UpdateProductSchema.parse(body);

    const updatedProduct = await productService.updateProduct(session, id, validatedData);
    return NextResponse.json({ success: true, data: updatedProduct });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to update product" }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "products:delete")) {
      return NextResponse.json({ success: false, error: "Forbidden: Missing products:delete permission" }, { status: 403 });
    }

    const { id } = await params;
    const result = await productService.archiveProduct(session, id);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to delete product" }, { status: 400 });
  }
}

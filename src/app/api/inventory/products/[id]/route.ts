import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { productService } from "@/domains/inventory/services/product.service";
import { updateProductSchema } from "@/domains/inventory/schemas/update-product.schema";
import { handleApiError } from "@/lib/api/handleApiError";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const product = await productService.getProductById(id, session.companyId);

    return NextResponse.json(product);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const body = updateProductSchema.parse(
      await request.json()
    );

    const product = await productService.updateProduct(
      id,
      session.companyId,
      body
    );

    return NextResponse.json(product);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const product = await productService.archiveProduct(id, session.companyId);

    return NextResponse.json(product);
  } catch (error) {
    return handleApiError(error);
  }
}
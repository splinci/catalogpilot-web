import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { createProductSchema } from "@/domains/inventory/schemas/create-product.schema";
import { productService } from "@/domains/inventory/services/product.service";
import { handleApiError } from "@/lib/api/handleApiError";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const products = await productService.getProducts(session.companyId);

    return NextResponse.json(products);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = createProductSchema.parse(
      await request.json()
    );

    const product = await productService.createProduct(session.companyId, body);

    return NextResponse.json(product, {
      status: 201,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
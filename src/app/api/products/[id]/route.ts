import { NextResponse } from "next/server";

import { productService } from "@/domains/product/services/productService";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const product =
      await productService.getProductById(id);

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch product." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: RouteContext
) {
  try {
    const body = await request.json();

    const { id } = await params;

    const product =
      await productService.updateProduct({
        ...body,
        id,
      });

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to update product." },
      { status: 500 }
    );
  }
}
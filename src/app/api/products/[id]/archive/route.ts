import { NextResponse } from "next/server";

import { productService } from "@/domains/product/services/productService";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    await productService.archiveProduct(id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to archive product.",
      },
      {
        status: 500,
      }
    );
  }
}
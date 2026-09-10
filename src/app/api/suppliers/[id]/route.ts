import { NextRequest, NextResponse } from "next/server";

import { supplierService } from "@/domains/supplier/services/supplier.service";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const supplier =
      await supplierService.update({
        id,
        ...body,
      });

    return NextResponse.json(supplier);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to update supplier.",
      },
      {
        status: 400,
      }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    await supplierService.archive(id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to archive supplier.",
      },
      {
        status: 400,
      }
    );
  }
}
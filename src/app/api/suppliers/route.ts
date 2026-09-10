import { NextRequest, NextResponse } from "next/server";

import { supplierService } from "@/domains/supplier/services/supplier.service";

export async function GET() {
  try {
    const suppliers =
      await supplierService.findAll();

    return NextResponse.json(suppliers);
  } catch {
    return NextResponse.json(
      {
        message: "Failed to load suppliers.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const supplier =
      await supplierService.create(body);

    return NextResponse.json(supplier, {
      status: 201,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to create supplier.",
      },
      {
        status: 400,
      }
    );
  }
}
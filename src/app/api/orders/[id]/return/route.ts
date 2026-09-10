import { NextResponse } from "next/server";
import { orderService } from "@/domains/order/services/order.service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await orderService.returnOrder(id);

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to return order.",
      },
      { status: 400 }
    );
  }
}
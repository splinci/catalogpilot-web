import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/domains/order/services/order.service";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await orderService.cancelOrder(id);

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to cancel order.",
      },
      {
        status: 500,
      }
    );
  }
}
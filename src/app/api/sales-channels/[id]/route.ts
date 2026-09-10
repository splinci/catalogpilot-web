import { NextRequest, NextResponse } from "next/server";

import { salesChannelService } from "@/domains/sales-channel/services/sales-channel.service";
import { handleApiError } from "@/lib/api/handleApiError";
import { updateSalesChannelSchema } from "@/domains/sales-channel/schemas/update-sales-channel.schema";

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
    const { id } = await params;

    const channel =
      await salesChannelService.getSalesChannelById(
        id
      );

    return NextResponse.json(channel);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const body =
      updateSalesChannelSchema.parse(
        await request.json()
      );

    const channel =
      await salesChannelService.updateSalesChannel(
        id,
        body
      );

    return NextResponse.json(channel);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    await salesChannelService.deleteSalesChannel(
      id
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
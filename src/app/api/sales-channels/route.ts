import { NextRequest, NextResponse } from "next/server";

import { salesChannelService } from "@/domains/sales-channel/services/sales-channel.service";
import { handleApiError } from "@/lib/api/handleApiError";
import { createSalesChannelSchema } from "@/domains/sales-channel/schemas/create-sales-channel.schema";

export async function GET() {
  try {
    const channels =
      await salesChannelService.getSalesChannels();

    return NextResponse.json(channels);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      createSalesChannelSchema.parse(
        await request.json()
      );

    const channel =
      await salesChannelService.createSalesChannel(
        body
      );

    return NextResponse.json(channel);
  } catch (error) {
    return handleApiError(error);
  }
}
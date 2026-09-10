import { createSalesChannelSchema } from "./create-sales-channel.schema";

export const updateSalesChannelSchema =
  createSalesChannelSchema.partial();
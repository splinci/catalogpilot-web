import { z } from "zod";

export const createSalesChannelSchema = z.object({
  name: z.string().trim().min(1),
  code: z.string().trim().min(1),

  type: z.enum([
    "MARKETPLACE",
    "STORE",
    "SOCIAL",
  ]),

  country: z.string().optional(),

  description: z.string().optional(),

  logoUrl: z.string().url().optional().or(z.literal("")),

  websiteUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal("")),

  enabled: z.boolean().optional(),
});
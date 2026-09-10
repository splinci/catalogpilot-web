import { z } from "zod";

export const createBrandSchema = z.object({
  name: z.string().trim().min(1),

  code: z.string().trim().min(1),

  description: z.string().optional(),

  websiteUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal("")),

  logoUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal("")),

  enabled: z.boolean().optional(),
});
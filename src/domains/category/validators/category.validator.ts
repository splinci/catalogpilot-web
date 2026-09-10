import { z } from "zod";

export const createCategorySchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .max(20),

  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100),

  description: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("")),
});

export const updateCategorySchema =
  createCategorySchema.extend({
    id: z.string().cuid(),
  });
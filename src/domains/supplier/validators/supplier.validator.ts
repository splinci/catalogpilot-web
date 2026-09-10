import { z } from "zod";

export const createSupplierSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .max(50),

  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(255),

  contactPerson: z
    .string()
    .trim()
    .optional(),

  email: z
    .string()
    .trim()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .trim()
    .optional(),

  address: z
    .string()
    .trim()
    .optional(),
});

export const updateSupplierSchema = createSupplierSchema.extend({
  id: z.string().cuid(),
});
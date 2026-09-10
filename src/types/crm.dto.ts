/**
 * ============================================================================
 * Atlas Commerce OS — Customer Relationship Management (CRM) DTO Schemas
 * ============================================================================
 * Specification Reference: CRM-001 / BSD-006 / DAT-001
 * ============================================================================
 */

import { z } from "zod";

export const CreateContactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

export const CreateAddressSchema = z.object({
  type: z.enum(["BILLING", "SHIPPING", "BOTH"]),
  street1: z.string().min(1, "Street address is required"),
  street2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required").default("US"),
  isDefault: z.boolean().default(false),
});

export const CreateCustomerSchema = z.object({
  customerCode: z.string().min(2, "Customer code must be at least 2 characters").toUpperCase().optional(),
  legalName: z.string().min(2, "Legal name is required"),
  email: z.string().email("Invalid primary email address"),
  phone: z.string().optional(),
  creditLimit: z.number().nonnegative().default(10000),
  creditHold: z.boolean().default(false),
  contacts: z.array(CreateContactSchema).optional().default([]),
  addresses: z.array(CreateAddressSchema).optional().default([]),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial();

export const CustomerQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.preprocess((val) => (val === "" ? undefined : val), z.string().optional()),
  creditHold: z.coerce.boolean().optional(),
});

export type CreateContactInput = z.infer<typeof CreateContactSchema>;
export type CreateAddressInput = z.infer<typeof CreateAddressSchema>;
export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;
export type CustomerQueryInput = z.infer<typeof CustomerQuerySchema>;

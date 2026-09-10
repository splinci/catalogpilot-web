/**
 * ============================================================================
 * Atlas Commerce OS — Finance & Accounting (FIN) DTO Schemas
 * ============================================================================
 * Specification Reference: FIN-001 / BSD-007 / DAT-001
 * ============================================================================
 */

import { z } from "zod";
import { InvoiceStatus, PaymentMethod } from "@prisma/client";

export const InvoiceStatusEnum = z.nativeEnum(InvoiceStatus);
export const PaymentMethodEnum = z.nativeEnum(PaymentMethod);

export const CreateInvoiceSchema = z.object({
  invoiceNumber: z.string().min(2, "Invoice number required").toUpperCase().optional(),
  customerId: z.string().min(1, "Customer ID is required"),
  salesOrderId: z.string().optional(),
  totalAmount: z.number().positive("Total amount must be greater than zero"),
  dueDate: z.string().datetime().or(z.string().transform((val) => new Date(val).toISOString())),
});

export const UpdateInvoiceSchema = CreateInvoiceSchema.partial();

export const InvoiceQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.preprocess((val) => (val === "" ? undefined : val), z.string().optional()),
  status: z.preprocess((val) => (val === "" || val === "undefined" ? undefined : val), InvoiceStatusEnum.optional()),
  customerId: z.preprocess((val) => (val === "" ? undefined : val), z.string().optional()),
});

export const RecordPaymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  amount: z.number().positive("Payment amount must be greater than zero"),
  method: PaymentMethodEnum.default(PaymentMethod.WIRE_TRANSFER),
  reference: z.string().optional(),
  paidAt: z.string().datetime().or(z.string().transform((val) => new Date(val).toISOString())).optional(),
});

export const CreateCreditNoteSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  cnNumber: z.string().min(2, "Credit note number required").toUpperCase().optional(),
  amount: z.number().positive("Credit note amount must be greater than zero"),
  reason: z.string().min(2, "Reason is required"),
});

export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof UpdateInvoiceSchema>;
export type InvoiceQueryInput = z.infer<typeof InvoiceQuerySchema>;
export type RecordPaymentInput = z.infer<typeof RecordPaymentSchema>;
export type CreateCreditNoteInput = z.infer<typeof CreateCreditNoteSchema>;

import { z } from "zod";
import { POStatus } from "@prisma/client";

export const CreateSupplierSchema = z.object({
  code: z.string().min(2).max(50).regex(/^[A-Za-z0-9_-]+$/, "Code must contain alphanumeric characters, dashes, or underscores"),
  name: z.string().min(2).max(100),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
});

export const POLineItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  orderedQty: z.number().int().positive("Ordered quantity must be positive"),
  unitCost: z.number().positive("Unit cost must be positive"),
});

export const CreatePurchaseOrderSchema = z.object({
  supplierId: z.string().min(1, "Supplier ID is required"),
  lines: z.array(POLineItemSchema).min(1, "At least one line item is required"),
});

export const GoodsReceiptLineSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  receivedQty: z.number().int().positive("Received quantity must be positive"),
  warehouseId: z.string().min(1, "Target Warehouse ID is required"),
});

export const ReceiveGoodsSchema = z.object({
  notes: z.string().optional(),
  lines: z.array(GoodsReceiptLineSchema).min(1, "At least one receiving line is required"),
});

export const POStatusTransitionSchema = z.object({
  status: z.nativeEnum(POStatus),
  reason: z.string().optional(),
});

export const PurchaseOrderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  supplierId: z.string().optional(),
  status: z.nativeEnum(POStatus).optional(),
});

export type CreateSupplierInput = z.infer<typeof CreateSupplierSchema>;
export type POLineItemInput = z.infer<typeof POLineItemSchema>;
export type CreatePurchaseOrderInput = z.infer<typeof CreatePurchaseOrderSchema>;
export type GoodsReceiptLineInput = z.infer<typeof GoodsReceiptLineSchema>;
export type ReceiveGoodsInput = z.infer<typeof ReceiveGoodsSchema>;
export type POStatusTransitionInput = z.infer<typeof POStatusTransitionSchema>;
export type PurchaseOrderQueryInput = z.infer<typeof PurchaseOrderQuerySchema>;

export interface ProcurementStats {
  totalOrders: number;
  openOrdersCount: number;
  pendingApprovalCount: number;
  totalSpend: number;
}

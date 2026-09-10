/**
 * ============================================================================
 * Atlas Commerce OS — Order Management System DTOs & Validation Schemas
 * ============================================================================
 * Specification Reference: M6-001 / BSD-005 / DBA-003
 * Scope: Sales Orders, Order Lines, Stock Reservations, Shipments
 * ============================================================================
 */

import { z } from "zod";
export type OrderStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "CONFIRMED"
  | "RESERVED"
  | "PICKING"
  | "PACKING"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export const OrderStatus = {
  DRAFT: "DRAFT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  CONFIRMED: "CONFIRMED",
  RESERVED: "RESERVED",
  PICKING: "PICKING",
  PACKING: "PACKING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export const CreateSalesOrderLineSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  unitPrice: z.number().nonnegative("Unit price must be non-negative"),
  discountAmount: z.number().nonnegative("Discount amount must be non-negative").default(0),
  taxAmount: z.number().nonnegative("Tax amount must be non-negative").default(0),
});

export const CreateSalesOrderSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  currency: z.string().min(1, "Currency is required").default("USD"),
  notes: z.string().optional(),
  lines: z.array(CreateSalesOrderLineSchema).min(1, "At least one order line item is required"),
});

export const OrderStatusTransitionSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  reason: z.string().optional(),
});

export const CreateShipmentLineSchema = z.object({
  salesOrderLineId: z.string().min(1, "Sales order line ID is required"),
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Shipped quantity must be positive"),
  warehouseId: z.string().min(1, "Warehouse ID is required"),
});

export const CreateShipmentSchema = z.object({
  carrier: z.string().min(1, "Carrier name is required"),
  trackingNumber: z.string().min(1, "Tracking number is required"),
  lines: z.array(CreateShipmentLineSchema).min(1, "At least one line item must be shipped"),
});

export const SalesOrderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
  search: z.string().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  customerId: z.string().optional(),
});

export type CreateSalesOrderLineInput = z.infer<typeof CreateSalesOrderLineSchema>;
export type CreateSalesOrderInput = z.infer<typeof CreateSalesOrderSchema>;
export type OrderStatusTransitionInput = z.infer<typeof OrderStatusTransitionSchema>;
export type CreateShipmentLineInput = z.infer<typeof CreateShipmentLineSchema>;
export type CreateShipmentInput = z.infer<typeof CreateShipmentSchema>;
export type SalesOrderQueryInput = z.infer<typeof SalesOrderQuerySchema>;

export interface OrderStats {
  totalOrders: number;
  openOrdersCount: number;
  shippedOrdersCount: number;
  totalRevenue: number;
}

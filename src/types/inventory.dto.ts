import { z } from "zod";
import { InventoryTransactionType, WarehouseBinType } from "@prisma/client";

export const StockAdjustmentSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  warehouseId: z.string().min(1, "Warehouse ID is required"),
  quantityDelta: z.number().int("Quantity delta must be an integer").refine((val) => val !== 0, "Quantity delta cannot be zero"),
  transactionType: z.nativeEnum(InventoryTransactionType),
  reference: z.string().optional(),
});

export const StockTransferSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  sourceWarehouseId: z.string().min(1, "Source Warehouse ID is required"),
  targetWarehouseId: z.string().min(1, "Target Warehouse ID is required"),
  quantity: z.number().int().positive("Transfer quantity must be positive"),
  reference: z.string().optional(),
});

export const CreateWarehouseSchema = z.object({
  code: z.string().min(2).max(50).regex(/^[A-Za-z0-9_-]+$/, "Code must contain alphanumeric characters, dashes, or underscores"),
  name: z.string().min(2).max(100),
  address: z.string().optional().nullable(),
});

export const CreateWarehouseBinSchema = z.object({
  warehouseId: z.string().min(1, "Warehouse ID is required"),
  binCode: z.string().min(1).max(50),
  binType: z.nativeEnum(WarehouseBinType).default(WarehouseBinType.PICK),
});

export const StockReservationSchema = z.object({
  salesOrderId: z.string().min(1, "Sales Order ID is required"),
  warehouseId: z.string().min(1, "Warehouse ID is required"),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive(),
    })
  ).min(1, "At least one item is required for reservation"),
});

export const InventoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  warehouseId: z.string().optional(),
  lowStockOnly: z.coerce.boolean().optional(),
});

export type StockAdjustmentInput = z.infer<typeof StockAdjustmentSchema>;
export type StockTransferInput = z.infer<typeof StockTransferSchema>;
export type CreateWarehouseInput = z.infer<typeof CreateWarehouseSchema>;
export type CreateWarehouseBinInput = z.infer<typeof CreateWarehouseBinSchema>;
export type StockReservationInput = z.infer<typeof StockReservationSchema>;
export type InventoryQueryInput = z.infer<typeof InventoryQuerySchema>;

export interface InventoryStats {
  totalItems: number;
  totalOnHandQty: number;
  totalReservedQty: number;
  totalAvailableQty: number;
  lowStockCount: number;
  outOfStockCount: number;
}

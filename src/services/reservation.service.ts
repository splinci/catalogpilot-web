import { inventoryRepository, InventoryRepository } from "@/repositories/inventory.repository";
import { auditService, AuditService } from "./audit.service";
import { StockReservationInput } from "@/types/inventory.dto";
import { UserSessionPayload } from "@/types/auth.dto";
import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class ReservationService {
  constructor(
    private inventoryRepo: InventoryRepository = inventoryRepository,
    private audit: AuditService = auditService
  ) {}

  async reserveStockForOrder(session: UserSessionPayload, input: StockReservationInput) {
    return prisma.$transaction(
      async (tx) => {
      const reservations = [];

      for (const item of input.items) {
        const invItem = await tx.inventoryItem.findFirst({
          where: {
            companyId: session.companyId,
            productId: item.productId,
            warehouseId: input.warehouseId,
          },
          include: { product: true },
        });

        if (!invItem) {
          throw new Error(`Inventory record not found for product ID '${item.productId}' in warehouse`);
        }

        if (invItem.availableQty < item.quantity) {
          throw new Error(
            `Insufficient stock for SKU '${invItem.product.sku}'. Available: ${invItem.availableQty}, Requested: ${item.quantity}`
          );
        }

        // Increment reserved quantity with atomic conditional update
        const updateRes = await tx.inventoryItem.updateMany({
          where: {
            id: invItem.id,
            companyId: session.companyId,
            availableQty: { gte: item.quantity },
          },
          data: {
            reservedQty: { increment: item.quantity },
            availableQty: { decrement: item.quantity },
            version: { increment: 1 },
          },
        });

        if (updateRes.count === 0) {
          throw new Error(
            `Insufficient stock for SKU '${invItem.product.sku}': Requested ${item.quantity} units, but available stock was depleted by concurrent transactions`
          );
        }

        const reservation = await tx.stockReservation.create({
          data: {
            inventoryItemId: invItem.id,
            salesOrderId: input.salesOrderId,
            reservedQty: item.quantity,
          },
        });

        reservations.push(reservation);
      }

      await tx.outboxMessage.create({
        data: {
          companyId: session.companyId,
          eventType: "STOCK_RESERVED",
          payload: {
            salesOrderId: input.salesOrderId,
            warehouseId: input.warehouseId,
            itemCount: input.items.length,
          },
        },
      });

      await this.audit.log({
        companyId: session.companyId,
        userId: session.userId,
        action: AuditAction.STOCK_ADJUSTED,
        entityName: "SalesOrder",
        entityId: input.salesOrderId,
        details: { event: "STOCK_RESERVED", items: input.items },
      });

      return reservations;
    }, { maxWait: 10000, timeout: 30000 });
  }

  async releaseOrderReservations(session: UserSessionPayload, salesOrderId: string) {
    return prisma.$transaction(async (tx) => {
      const reservations = await tx.stockReservation.findMany({
        where: { salesOrderId },
        include: { inventoryItem: true },
      });

      if (reservations.length === 0) {
        return { releasedCount: 0 };
      }

      for (const res of reservations) {
        const item = res.inventoryItem;
        const newReserved = Math.max(0, item.reservedQty - res.reservedQty);
        const newAvailable = item.onHandQty - newReserved;

        await tx.inventoryItem.update({
          where: { id: item.id },
          data: {
            reservedQty: newReserved,
            availableQty: newAvailable,
            version: { increment: 1 },
          },
        });
      }

      await tx.stockReservation.deleteMany({
        where: { salesOrderId },
      });

      await tx.outboxMessage.create({
        data: {
          companyId: session.companyId,
          eventType: "RESERVATION_RELEASED",
          payload: { salesOrderId },
        },
      });

      return { releasedCount: reservations.length };
    });
  }
}

export const reservationService = new ReservationService();

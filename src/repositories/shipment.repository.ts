/**
 * ============================================================================
 * Atlas Commerce OS — Shipment Repository Implementation
 * ============================================================================
 * Specification Reference: M6-001 / BSD-005 / DBA-003
 * Entity: Shipment Aggregate Root
 * 
 * Responsibilities:
 * - Transactional shipment dispatch inside `prisma.$transaction`
 * - Physical stock deduction (`InventoryItem.onHandQty` and `reservedQty`)
 * - Immutable stock ledger creation (`InventoryTransaction` type SALE)
 * - StockReservation release
 * - SalesOrder status update to SHIPPED
 * - Outbox domain event publishing (`OrderShipped`)
 * ============================================================================
 */

import { BaseRepository } from "./base/base.repository";
import { CreateShipmentLineInput } from "@/types/order.dto";
import { InventoryTransactionType, OrderStatus } from "@prisma/client";

export class ShipmentRepository extends BaseRepository {
  /**
   * Resolve Shipment aggregate by ID with tenant isolation.
   */
  async findById(companyId: string, id: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
      include: {
        salesOrder: {
          include: { customer: true },
        },
      },
    });

    if (!shipment || shipment.salesOrder.companyId !== companyId) {
      return null;
    }

    return shipment;
  }

  /**
   * Find shipments associated with a Sales Order.
   */
  async findByOrder(companyId: string, salesOrderId: string) {
    const order = await this.prisma.salesOrder.findFirst({
      where: { id: salesOrderId, companyId, deletedAt: null },
    });

    if (!order) return [];

    return this.prisma.shipment.findMany({
      where: { salesOrderId },
      orderBy: { shippedAt: "desc" },
    });
  }

  /**
   * Atomic Shipment dispatch transaction logic.
   */
  async createShipment(
    companyId: string,
    salesOrderId: string,
    carrier: string,
    trackingNumber: string,
    lines: CreateShipmentLineInput[],
    userId?: string
  ) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.findFirst({
        where: { id: salesOrderId, companyId, deletedAt: null },
        include: { lines: true },
      });

      if (!order) {
        throw new Error("Sales order not found or access denied");
      }

      if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.COMPLETED) {
        throw new Error(`Cannot ship Sales Order in finalized status '${order.status}'`);
      }

      // 1. Create Shipment header
      const shipment = await tx.shipment.create({
        data: {
          salesOrderId,
          carrier,
          trackingNumber,
          shippedAt: new Date(),
        },
      });

      // 2. Process physical stock deduction per shipped line
      for (const line of lines) {
        const invItem = await tx.inventoryItem.findFirst({
          where: {
            companyId,
            productId: line.productId,
            warehouseId: line.warehouseId,
          },
        });

        if (!invItem) {
          throw new Error(`Inventory item for product ID '${line.productId}' not found in warehouse '${line.warehouseId}'`);
        }

        if (invItem.onHandQty < line.quantity) {
          throw new Error(`Insufficient stock for product ID '${line.productId}'. On hand: ${invItem.onHandQty}, requested: ${line.quantity}`);
        }

        // Deduct physical onHandQty and reservedQty
        const updatedItem = await tx.inventoryItem.update({
          where: { id: invItem.id },
          data: {
            onHandQty: invItem.onHandQty - line.quantity,
            reservedQty: Math.max(0, invItem.reservedQty - line.quantity),
            updatedBy: userId,
            version: { increment: 1 },
          },
        });

        // Insert immutable InventoryTransaction SALE ledger
        await tx.inventoryTransaction.create({
          data: {
            companyId,
            inventoryItemId: updatedItem.id,
            transactionType: InventoryTransactionType.SALE,
            quantity: -line.quantity,
            reference: `SHIP-${trackingNumber}`,
          },
        });
      }

      // 3. Delete / release active stock reservations for this order
      await tx.stockReservation.deleteMany({
        where: { salesOrderId },
      });

      // 4. Update SalesOrder status to SHIPPED
      await tx.salesOrder.update({
        where: { id: salesOrderId },
        data: {
          status: OrderStatus.SHIPPED,
          updatedBy: userId,
          version: { increment: 1 },
        },
      });

      // 5. Emit Outbox Event OrderShipped
      await tx.outboxMessage.create({
        data: {
          companyId,
          eventType: "OrderShipped",
          payload: {
            salesOrderId,
            orderNumber: order.orderNumber,
            shipmentId: shipment.id,
            trackingNumber,
            carrier,
            shippedAt: new Date().toISOString(),
          },
        },
      });

      return shipment;
    });
  }
}

export const shipmentRepository = new ShipmentRepository();

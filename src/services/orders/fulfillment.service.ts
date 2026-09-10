/**
 * ============================================================================
 * Atlas Commerce OS — Fulfillment Domain Service
 * ============================================================================
 * Specification Reference: ORD-002 / BSD-005 / M6-001
 * Domain: Stock Reservation & Warehouse Fulfillment Orchestration
 * 
 * Responsibilities:
 * - Real-time stock reservation for confirmed orders
 * - Pick list generation and picking/packing state machine transitions
 * - Reservation release on cancellation
 * - Outbox domain event publishing (InventoryReserved, PickingStarted, Packed)
 * ============================================================================
 */

import { salesOrderRepository, SalesOrderRepository } from "@/repositories/sales-order.repository";
import { orderLifecyclePolicy, OrderLifecyclePolicy } from "./order-lifecycle.policy";
import { inventoryReservationPolicy, InventoryReservationPolicy } from "./inventory-reservation.policy";
import { UserSessionPayload } from "@/types/auth.dto";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class FulfillmentService {
  constructor(
    private orderRepo: SalesOrderRepository = salesOrderRepository,
    private lifecyclePolicy: OrderLifecyclePolicy = orderLifecyclePolicy,
    private reservationPolicy: InventoryReservationPolicy = inventoryReservationPolicy
  ) {}

  /**
   * Reserve inventory stock for a confirmed Sales Order.
   */
  async reserveInventory(session: UserSessionPayload, orderId: string, targetWarehouseId: string) {
    const order = await this.orderRepo.findById(session.companyId, orderId);
    if (!order) {
      throw new Error("Sales order not found or access denied");
    }

    return prisma.$transaction(
      async (tx) => {
      for (const line of order.lines) {
        let invItem = await tx.inventoryItem.findFirst({
          where: {
            companyId: session.companyId,
            productId: line.productId,
            warehouseId: targetWarehouseId,
          },
        });

        if (!invItem) {
          throw new Error(`Inventory item for product ID '${line.productId}' not found in warehouse '${targetWarehouseId}'`);
        }

        // Validate available stock
        this.reservationPolicy.validateAvailability(
          line.product?.title || line.productId,
          invItem.availableQty,
          line.quantity
        );

        // Update InventoryItem quantities atomically with conditional check
        const updateRes = await tx.inventoryItem.updateMany({
          where: {
            id: invItem.id,
            companyId: session.companyId,
            availableQty: { gte: line.quantity },
          },
          data: {
            reservedQty: { increment: line.quantity },
            availableQty: { decrement: line.quantity },
            updatedBy: session.userId,
            version: { increment: 1 },
          },
        });

        if (updateRes.count === 0) {
          throw new Error(
            `Insufficient available stock for '${line.product?.title || line.productId}': Requested ${line.quantity} units, but available stock was depleted by concurrent transactions`
          );
        }

        // Insert StockReservation record
        await tx.stockReservation.create({
          data: {
            inventoryItemId: invItem.id,
            salesOrderId: order.id,
            reservedQty: line.quantity,
          },
        });
      }

      // Transition order status to RESERVED
      const updatedOrder = await tx.salesOrder.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.RESERVED,
          updatedBy: session.userId,
          version: { increment: 1 },
        },
      });

      // Emit Outbox Event InventoryReserved
      await tx.outboxMessage.create({
        data: {
          companyId: session.companyId,
          eventType: "InventoryReserved",
          payload: {
            salesOrderId: order.id,
            orderNumber: order.orderNumber,
            warehouseId: targetWarehouseId,
            reservedAt: new Date().toISOString(),
          },
        },
      });

      return updatedOrder;
    }, { maxWait: 10000, timeout: 30000 });
  }

  /**
   * Start picking workflow (CONFIRMED/RESERVED -> PICKING).
   */
  async startPicking(session: UserSessionPayload, orderId: string) {
    const order = await this.orderRepo.findById(session.companyId, orderId);
    if (!order) {
      throw new Error("Sales order not found or access denied");
    }

    this.lifecyclePolicy.validateTransition(order.status, OrderStatus.PICKING);

    const updated = await this.orderRepo.updateStatus(session.companyId, orderId, OrderStatus.PICKING, session.userId);

    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType: "PickingStarted",
        payload: {
          salesOrderId: order.id,
          orderNumber: order.orderNumber,
          startedAt: new Date().toISOString(),
        },
      },
    });

    return updated;
  }

  /**
   * Complete packing workflow (PICKING -> PACKING).
   */
  async packOrder(session: UserSessionPayload, orderId: string) {
    const order = await this.orderRepo.findById(session.companyId, orderId);
    if (!order) {
      throw new Error("Sales order not found or access denied");
    }

    this.lifecyclePolicy.validateTransition(order.status, OrderStatus.PACKING);

    const updated = await this.orderRepo.updateStatus(session.companyId, orderId, OrderStatus.PACKING, session.userId);

    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType: "Packed",
        payload: {
          salesOrderId: order.id,
          orderNumber: order.orderNumber,
          packedAt: new Date().toISOString(),
        },
      },
    });

    return updated;
  }
}

export const fulfillmentService = new FulfillmentService();

/**
 * ============================================================================
 * Atlas Commerce OS — Shipment Domain Service
 * ============================================================================
 * Specification Reference: ORD-002 / BSD-005 / M6-001
 * Domain: Shipment Dispatch & Delivery Lifecycle Management
 * 
 * Responsibilities:
 * - Shipment dispatch orchestration calling ShipmentRepository
 * - Confirming order delivery (SHIPPED -> DELIVERED)
 * - Outbox domain event publishing (OrderShipped, OrderDelivered)
 * ============================================================================
 */

import { shipmentRepository, ShipmentRepository } from "@/repositories/shipment.repository";
import { salesOrderRepository, SalesOrderRepository } from "@/repositories/sales-order.repository";
import { orderLifecyclePolicy, OrderLifecyclePolicy } from "./order-lifecycle.policy";
import { auditService, AuditService } from "../audit.service";
import { UserSessionPayload } from "@/types/auth.dto";
import { CreateShipmentInput } from "@/types/order.dto";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class ShipmentService {
  constructor(
    private shipmentRepo: ShipmentRepository = shipmentRepository,
    private orderRepo: SalesOrderRepository = salesOrderRepository,
    private policy: OrderLifecyclePolicy = orderLifecyclePolicy,
    private audit: AuditService = auditService
  ) {}

  /**
   * Dispatch Shipment for a Sales Order.
   */
  async dispatchShipment(session: UserSessionPayload, orderId: string, input: CreateShipmentInput) {
    const order = await this.orderRepo.findById(session.companyId, orderId);
    if (!order) {
      throw new Error("Sales order not found or access denied");
    }

    this.policy.validateTransition(order.status, OrderStatus.SHIPPED);

    const shipment = await this.shipmentRepo.createShipment(
      session.companyId,
      orderId,
      input.carrier,
      input.trackingNumber,
      input.lines,
      session.userId
    );

    return shipment;
  }

  /**
   * Confirm Delivery (SHIPPED -> DELIVERED).
   */
  async confirmDelivery(session: UserSessionPayload, orderId: string) {
    const order = await this.orderRepo.findById(session.companyId, orderId);
    if (!order) {
      throw new Error("Sales order not found or access denied");
    }

    this.policy.validateTransition(order.status, OrderStatus.DELIVERED);

    const updated = await this.orderRepo.updateStatus(session.companyId, orderId, OrderStatus.DELIVERED, session.userId);

    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType: "OrderDelivered",
        payload: {
          salesOrderId: order.id,
          orderNumber: order.orderNumber,
          deliveredAt: new Date().toISOString(),
        },
      },
    });

    return updated;
  }
}

export const shipmentService = new ShipmentService();

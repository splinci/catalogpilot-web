/**
 * ============================================================================
 * Atlas Commerce OS — Order Domain Service
 * ============================================================================
 * Specification Reference: ORD-002 / BSD-005 / M6-001
 * Domain: Sales Order Aggregate Lifecycle Orchestration
 * 
 * Responsibilities:
 * - Create, confirm, cancel, and close sales orders
 * - Publish transactional outbox events (SalesOrderCreated, SalesOrderConfirmed, SalesOrderCancelled)
 * - Record audit logs via AuditService
 * ============================================================================
 */

import { salesOrderRepository, SalesOrderRepository } from "@/repositories/sales-order.repository";
import { orderLifecyclePolicy, OrderLifecyclePolicy } from "./order-lifecycle.policy";
import { auditService, AuditService } from "../audit.service";
import { UserSessionPayload } from "@/types/auth.dto";
import { CreateSalesOrderInput } from "@/types/order.dto";
import { AuditAction, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class OrderService {
  constructor(
    private repo: SalesOrderRepository = salesOrderRepository,
    private policy: OrderLifecyclePolicy = orderLifecyclePolicy,
    private audit: AuditService = auditService
  ) {}

  /**
   * Create Sales Order aggregate.
   */
  async createSalesOrder(session: UserSessionPayload, input: CreateSalesOrderInput) {
    const customer = await prisma.customer.findFirst({
      where: { id: input.customerId, companyId: session.companyId, deletedAt: null },
    });

    if (!customer) {
      throw new Error(`Customer ID '${input.customerId}' not found or access denied`);
    }

    // Validate that line item product IDs belong to the session's tenant
    const productIds = input.lines.map((l) => l.productId);
    const validProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, companyId: session.companyId, deletedAt: null },
    });

    if (validProducts.length !== productIds.length) {
      throw new Error("One or more product IDs are invalid or access denied");
    }

    const order = await this.repo.createOrder(session.companyId, input, session.userId);

    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType: "SalesOrderCreated",
        payload: {
          salesOrderId: order.id,
          orderNumber: order.orderNumber,
          customerId: order.customerId,
          totalAmount: order.totalAmount,
          lineCount: order.lines.length,
          createdAt: new Date().toISOString(),
        },
      },
    });

    await this.audit.log({
      companyId: session.companyId,
      userId: session.userId,
      action: AuditAction.ORDER_PLACED,
      entityName: "SalesOrder",
      entityId: order.id,
      details: {
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
      },
    });

    return order;
  }

  /**
   * Get Sales Order by ID with tenant isolation.
   */
  async getSalesOrderById(session: UserSessionPayload, orderId: string) {
    return this.repo.findById(session.companyId, orderId);
  }

  /**
   * Confirm Sales Order (DRAFT -> CONFIRMED).
   */
  async confirmOrder(session: UserSessionPayload, orderId: string) {
    const order = await this.repo.findById(session.companyId, orderId);
    if (!order) {
      throw new Error("Sales order not found or access denied");
    }

    this.policy.validateTransition(order.status, OrderStatus.CONFIRMED);

    const updated = await this.repo.updateStatus(session.companyId, orderId, OrderStatus.CONFIRMED, session.userId);

    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType: "SalesOrderConfirmed",
        payload: {
          salesOrderId: order.id,
          orderNumber: order.orderNumber,
          confirmedAt: new Date().toISOString(),
        },
      },
    });

    await this.audit.log({
      companyId: session.companyId,
      userId: session.userId,
      action: AuditAction.ORDER_PLACED,
      entityName: "SalesOrder",
      entityId: order.id,
      details: {
        orderNumber: order.orderNumber,
        status: OrderStatus.CONFIRMED,
      },
    });

    return updated;
  }

  /**
   * Cancel Sales Order.
   */
  async cancelOrder(session: UserSessionPayload, orderId: string, reason?: string) {
    const order = await this.repo.findById(session.companyId, orderId);
    if (!order) {
      throw new Error("Sales order not found or access denied");
    }

    this.policy.validateTransition(order.status, OrderStatus.CANCELLED);

    // Release stock reservations if present
    await prisma.stockReservation.deleteMany({
      where: { salesOrderId: orderId },
    });

    const updated = await this.repo.updateStatus(session.companyId, orderId, OrderStatus.CANCELLED, session.userId);

    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType: "SalesOrderCancelled",
        payload: {
          salesOrderId: order.id,
          orderNumber: order.orderNumber,
          reason,
          cancelledAt: new Date().toISOString(),
        },
      },
    });

    return updated;
  }

  /**
   * Finalize/Close Sales Order (COMPLETED).
   */
  async closeOrder(session: UserSessionPayload, orderId: string) {
    const order = await this.repo.findById(session.companyId, orderId);
    if (!order) {
      throw new Error("Sales order not found or access denied");
    }

    this.policy.validateTransition(order.status, OrderStatus.COMPLETED);

    return this.repo.updateStatus(session.companyId, orderId, OrderStatus.COMPLETED, session.userId);
  }
}

export const orderService = new OrderService();

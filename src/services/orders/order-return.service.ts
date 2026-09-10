/**
 * ============================================================================
 * Splinci Commerce OS — Order Return / RMA Domain Service
 * ============================================================================
 * Specification Reference: E2E-006 / ORD-002 / BSD-005
 * Domain: Return Merchandise Authorization (RMA) & Inventory Disposition Engine
 * ============================================================================
 */

import { prisma } from "@/lib/prisma";
import { UserSessionPayload } from "@/types/auth.dto";
import { AuditAction, OrderStatus } from "@prisma/client";
import { auditService, AuditService } from "../audit.service";
import { orderPaymentService, OrderPaymentService } from "./order-payment.service";

export type ReturnDisposition = "RESTOCK" | "DAMAGED" | "QUARANTINE" | "REJECTED";

export interface RequestReturnLineInput {
  salesOrderLineId: string;
  quantity: number;
  reason: string;
}

export interface RequestReturnInput {
  salesOrderId: string;
  lines: RequestReturnLineInput[];
  notes?: string;
}

export interface InspectReturnLineInput {
  salesOrderLineId: string;
  quantity: number;
  warehouseId: string;
  disposition: ReturnDisposition;
}

export interface InspectReturnInput {
  salesOrderId: string;
  rmaNumber: string;
  lines: InspectReturnLineInput[];
}

export class OrderReturnService {
  constructor(
    private paymentService: OrderPaymentService = orderPaymentService,
    private audit: AuditService = auditService
  ) {}

  /**
   * Request Return / RMA for an Order.
   */
  async requestReturn(session: UserSessionPayload, input: RequestReturnInput) {
    const order = await prisma.salesOrder.findFirst({
      where: { id: input.salesOrderId, companyId: session.companyId },
      include: { lines: true },
    });

    if (!order) {
      throw new Error("Sales order not found or access denied");
    }

    if (input.lines.length === 0) {
      throw new Error("At least one line item must be specified for return");
    }

    // Validate quantities against original order lines
    for (const reqLine of input.lines) {
      const line = order.lines.find((l) => l.id === reqLine.salesOrderLineId);
      if (!line) {
        throw new Error(`Order line '${reqLine.salesOrderLineId}' not found on order`);
      }
      if (reqLine.quantity <= 0) {
        throw new Error("Return quantity must be positive");
      }
      if (reqLine.quantity > line.quantity) {
        throw new Error(`Return quantity (${reqLine.quantity}) exceeds purchased quantity (${line.quantity})`);
      }
    }

    const rmaNumber = `RMA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return prisma.$transaction(async (tx) => {
      await tx.outboxMessage.create({
        data: {
          companyId: session.companyId,
          eventType: "ReturnRequested",
          payload: JSON.parse(JSON.stringify({
            salesOrderId: order.id,
            rmaNumber,
            lines: input.lines,
            status: "RETURN_REQUESTED",
          })),
        },
      });

      await this.audit.log({
        companyId: session.companyId,
        userId: session.userId,
        action: AuditAction.USER_UPDATED,
        entityName: "SalesOrder",
        entityId: order.id,
        details: { rmaNumber, status: "RETURN_REQUESTED", lineCount: input.lines.length },
      });

      return {
        salesOrderId: order.id,
        rmaNumber,
        status: "RETURN_REQUESTED",
        lines: input.lines,
      };
    }, { maxWait: 10000, timeout: 30000 });
  }

  /**
   * Authorize RMA Request.
   */
  async authorizeRMA(session: UserSessionPayload, salesOrderId: string, rmaNumber: string) {
    const order = await prisma.salesOrder.findFirst({
      where: { id: salesOrderId, companyId: session.companyId },
    });

    if (!order) {
      throw new Error("Sales order not found or access denied");
    }

    return prisma.$transaction(async (tx) => {
      await tx.outboxMessage.create({
        data: {
          companyId: session.companyId,
          eventType: "RMAAuthorized",
          payload: { salesOrderId, rmaNumber, status: "RMA_AUTHORIZED" },
        },
      });

      await this.audit.log({
        companyId: session.companyId,
        userId: session.userId,
        action: AuditAction.USER_UPDATED,
        entityName: "SalesOrder",
        entityId: salesOrderId,
        details: { rmaNumber, status: "RMA_AUTHORIZED" },
      });

      return { salesOrderId, rmaNumber, status: "RMA_AUTHORIZED" };
    }, { maxWait: 10000, timeout: 30000 });
  }

  /**
   * Receive Return items in warehouse.
   */
  async receiveReturn(session: UserSessionPayload, salesOrderId: string, rmaNumber: string) {
    const order = await prisma.salesOrder.findFirst({
      where: { id: salesOrderId, companyId: session.companyId },
    });

    if (!order) {
      throw new Error("Sales order not found or access denied");
    }

    return prisma.$transaction(async (tx) => {
      await tx.outboxMessage.create({
        data: {
          companyId: session.companyId,
          eventType: "ReturnReceived",
          payload: { salesOrderId, rmaNumber, status: "RETURN_RECEIVED" },
        },
      });

      await this.audit.log({
        companyId: session.companyId,
        userId: session.userId,
        action: AuditAction.USER_UPDATED,
        entityName: "SalesOrder",
        entityId: salesOrderId,
        details: { rmaNumber, status: "RETURN_RECEIVED" },
      });

      return { salesOrderId, rmaNumber, status: "RETURN_RECEIVED" };
    }, { maxWait: 10000, timeout: 30000 });
  }

  /**
   * Inspect Returned items and execute Inventory Disposition.
   */
  async inspectAndDisposeReturn(session: UserSessionPayload, input: InspectReturnInput) {
    const order = await prisma.salesOrder.findFirst({
      where: { id: input.salesOrderId, companyId: session.companyId },
      include: { lines: true },
    });

    if (!order) {
      throw new Error("Sales order not found or access denied");
    }

    return prisma.$transaction(async (tx) => {
      for (const item of input.lines) {
        const orderLine = order.lines.find((l) => l.id === item.salesOrderLineId);
        if (!orderLine) {
          throw new Error(`Order line '${item.salesOrderLineId}' not found`);
        }

        if (item.disposition === "RESTOCK") {
          // Atomically Increment Sellable InventoryItem Stock
          const invItem = await tx.inventoryItem.findFirst({
            where: {
              companyId: session.companyId,
              productId: orderLine.productId,
              warehouseId: item.warehouseId,
            },
          });

          if (!invItem) {
            throw new Error(`Inventory item for product '${orderLine.productId}' not found in warehouse '${item.warehouseId}'`);
          }

          await tx.inventoryItem.update({
            where: { id: invItem.id },
            data: {
              onHandQty: { increment: item.quantity },
              availableQty: { increment: item.quantity },
              version: { increment: 1 },
              updatedBy: session.userId,
            },
          });

          // Record Inventory Transaction
          await tx.inventoryTransaction.create({
            data: {
              companyId: session.companyId,
              inventoryItemId: invItem.id,
              transactionType: "ADJUSTMENT_IN",
              quantity: item.quantity,
              reference: `RETURN_RESTOCK_${input.rmaNumber}`,
            },
          });
        }
      }

      // Update Order Status to CANCELLED / RETURNED
      await tx.salesOrder.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELLED },
      });

      await tx.outboxMessage.create({
        data: {
          companyId: session.companyId,
          eventType: "ReturnInspected",
          payload: JSON.parse(JSON.stringify({
            salesOrderId: order.id,
            rmaNumber: input.rmaNumber,
            dispositions: input.lines.map((l) => ({ lineId: l.salesOrderLineId, disposition: l.disposition, qty: l.quantity })),
            status: "ACCEPTED",
          })),
        },
      });

      await this.audit.log({
        companyId: session.companyId,
        userId: session.userId,
        action: AuditAction.STOCK_ADJUSTED,
        entityName: "SalesOrder",
        entityId: order.id,
        details: { rmaNumber: input.rmaNumber, lineCount: input.lines.length, status: "RETURN_ACCEPTED" },
      });

      return {
        salesOrderId: order.id,
        rmaNumber: input.rmaNumber,
        status: "RETURN_ACCEPTED",
        dispositions: input.lines,
      };
    }, { maxWait: 10000, timeout: 30000 });
  }

  /**
   * Execute Refund for Accepted Return.
   */
  async processReturnRefund(session: UserSessionPayload, salesOrderId: string, paymentId: string, refundAmount: number, reason?: string) {
    return this.paymentService.refundPayment(session, {
      salesOrderId,
      paymentId,
      amount: refundAmount,
      reason: reason || "Return RMA Refund",
    });
  }

  /**
   * Get Return RMA by rmaNumber with tenant isolation.
   */
  async getReturnByRMA(session: UserSessionPayload, rmaNumber: string) {
    const outbox = await prisma.outboxMessage.findFirst({
      where: {
        companyId: session.companyId,
        eventType: "ReturnRequested",
      },
    });
    if (!outbox) return null;
    const payload = outbox.payload as any;
    if (payload?.rmaNumber === rmaNumber) {
      return payload;
    }
    return null;
  }
}

export const orderReturnService = new OrderReturnService();

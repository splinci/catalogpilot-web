/**
 * ============================================================================
 * Splinci Commerce OS — Order Payment Domain Service
 * ============================================================================
 * Specification Reference: E2E-006 / FIN-003 / BSD-005
 * Domain: Order Payment Lifecycle Engine (Authorize, Capture, Void, Refund)
 * ============================================================================
 */

import { prisma } from "@/lib/prisma";
import { UserSessionPayload } from "@/types/auth.dto";
import { AuditAction, InvoiceStatus, PaymentMethod } from "@prisma/client";
import { auditService, AuditService } from "../audit.service";
import { mockPaymentProvider, PaymentProvider } from "../payments/payment-provider.interface";

export interface AuthorizePaymentInput {
  salesOrderId: string;
  amount: number;
  paymentMethod?: PaymentMethod;
  idempotencyKey?: string;
}

export interface CapturePaymentInput {
  salesOrderId: string;
  paymentId: string;
  amount: number;
  idempotencyKey?: string;
}

export interface VoidPaymentInput {
  salesOrderId: string;
  paymentId: string;
  reason?: string;
}

export interface RefundPaymentInput {
  salesOrderId: string;
  paymentId: string;
  amount: number;
  reason?: string;
  idempotencyKey?: string;
}

export class OrderPaymentService {
  constructor(
    private provider: PaymentProvider = mockPaymentProvider,
    private audit: AuditService = auditService
  ) {}

  /**
   * Authorize Payment for a Sales Order.
   */
  async authorizePayment(session: UserSessionPayload, input: AuthorizePaymentInput) {
    const order = await prisma.salesOrder.findFirst({
      where: { id: input.salesOrderId, companyId: session.companyId },
      include: { invoice: { include: { payments: true } } },
    });

    if (!order) {
      throw new Error("Sales order not found or access denied");
    }

    if (input.amount <= 0) {
      throw new Error("Payment authorization amount must be positive");
    }

    if (input.amount > Number(order.totalAmount)) {
      throw new Error(`Authorization amount (${input.amount}) exceeds order total (${order.totalAmount})`);
    }

    // Idempotency Check
    if (input.idempotencyKey) {
      const existingMsg = await prisma.outboxMessage.findFirst({
        where: {
          companyId: session.companyId,
          eventType: "PaymentAuthorized",
          payload: { path: ["idempotencyKey"], equals: input.idempotencyKey },
        },
      });

      if (existingMsg) {
        const paymentId = (existingMsg.payload as any)?.paymentId;
        const existingPayment = await prisma.payment.findUnique({ where: { id: paymentId } });
        if (existingPayment) {
          return existingPayment;
        }
      }
    }

    // Execute External Gateway Provider Call
    const gatewayRes = await this.provider.authorize({
      salesOrderId: order.id,
      amount: input.amount,
      currency: "USD",
      paymentMethod: input.paymentMethod || PaymentMethod.WIRE_TRANSFER,
      idempotencyKey: input.idempotencyKey,
    });

    if (!gatewayRes.success) {
      // Record Failed Payment
      await prisma.outboxMessage.create({
        data: {
          companyId: session.companyId,
          eventType: "PaymentFailed",
          payload: {
            salesOrderId: order.id,
            amount: input.amount,
            reason: gatewayRes.errorMessage || "Authorization failed",
          },
        },
      });

      throw new Error(`Payment authorization failed: ${gatewayRes.errorMessage || "Gateway rejected authorization"}`);
    }

    // Persist Payment Authorization in Prisma Transaction
    return prisma.$transaction(async (tx) => {
      // Ensure Invoice exists
      let invoice = order.invoice;
      if (!invoice) {
        invoice = await tx.invoice.create({
          data: {
            companyId: session.companyId,
            invoiceNumber: `INV-${order.orderNumber}`,
            salesOrderId: order.id,
            customerId: order.customerId,
            totalAmount: order.totalAmount,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: InvoiceStatus.ISSUED,
          },
          include: { payments: true },
        });
      }

      const payment = await tx.payment.create({
        data: {
          companyId: session.companyId,
          invoiceId: invoice.id,
          amount: input.amount,
          method: input.paymentMethod || PaymentMethod.WIRE_TRANSFER,
          reference: gatewayRes.authorizationId,
          paidAt: new Date(),
        },
      });

      await tx.outboxMessage.create({
        data: {
          companyId: session.companyId,
          eventType: "PaymentAuthorized",
          payload: {
            salesOrderId: order.id,
            invoiceId: invoice.id,
            paymentId: payment.id,
            amount: Number(payment.amount),
            authorizationId: gatewayRes.authorizationId,
            idempotencyKey: input.idempotencyKey,
          },
        },
      });

      await this.audit.log({
        companyId: session.companyId,
        userId: session.userId,
        action: AuditAction.USER_UPDATED,
        entityName: "Payment",
        entityId: payment.id,
        details: {
          salesOrderId: order.id,
          invoiceId: invoice.id,
          amount: Number(payment.amount),
          status: "AUTHORIZED",
        },
      });

      return payment;
    }, { maxWait: 10000, timeout: 30000 });
  }

  /**
   * Capture Authorized Payment.
   */
  async capturePayment(session: UserSessionPayload, input: CapturePaymentInput) {
    const payment = await prisma.payment.findFirst({
      where: { id: input.paymentId, companyId: session.companyId },
      include: { invoice: { include: { salesOrder: true, payments: true } } },
    });

    if (!payment) {
      throw new Error("Payment record not found or access denied");
    }

    if (input.amount <= 0) {
      throw new Error("Capture amount must be positive");
    }

    if (input.amount > Number(payment.amount)) {
      throw new Error(`Capture amount (${input.amount}) exceeds authorized amount (${payment.amount})`);
    }

    // Idempotency Check
    if (input.idempotencyKey) {
      const existingMsg = await prisma.outboxMessage.findFirst({
        where: {
          companyId: session.companyId,
          eventType: "PaymentCaptured",
          payload: { path: ["idempotencyKey"], equals: input.idempotencyKey },
        },
      });

      if (existingMsg) {
        return payment;
      }
    }

    const gatewayRes = await this.provider.capture({
      authorizationId: payment.reference || payment.id,
      amount: input.amount,
      idempotencyKey: input.idempotencyKey,
    });

    if (!gatewayRes.success) {
      throw new Error("Gateway failed to capture payment");
    }

    return prisma.$transaction(async (tx) => {
      // Update Invoice Status
      const invoice = payment.invoice;
      const totalPaid = (invoice.payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
      const isFullyPaid = totalPaid >= Number(invoice.totalAmount);

      if (isFullyPaid) {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { status: InvoiceStatus.PAID, postedAt: new Date() },
        });
      }

      await tx.outboxMessage.create({
        data: {
          companyId: session.companyId,
          eventType: "PaymentCaptured",
          payload: {
            salesOrderId: invoice.salesOrderId,
            invoiceId: invoice.id,
            paymentId: payment.id,
            capturedAmount: input.amount,
            idempotencyKey: input.idempotencyKey,
          },
        },
      });

      await this.audit.log({
        companyId: session.companyId,
        userId: session.userId,
        action: AuditAction.USER_UPDATED,
        entityName: "Payment",
        entityId: payment.id,
        details: {
          salesOrderId: invoice.salesOrderId,
          invoiceId: invoice.id,
          capturedAmount: input.amount,
          status: "CAPTURED",
        },
      });

      return payment;
    }, { maxWait: 10000, timeout: 30000 });
  }

  /**
   * Void Payment Authorization.
   */
  async voidPayment(session: UserSessionPayload, input: VoidPaymentInput) {
    const payment = await prisma.payment.findFirst({
      where: { id: input.paymentId, companyId: session.companyId },
      include: { invoice: true },
    });

    if (!payment) {
      throw new Error("Payment record not found or access denied");
    }

    const gatewayRes = await this.provider.void({
      authorizationId: payment.reference || payment.id,
      reason: input.reason,
    });

    if (!gatewayRes.success) {
      throw new Error("Gateway rejected payment void");
    }

    return prisma.$transaction(async (tx) => {
      await tx.payment.delete({ where: { id: payment.id } });

      await tx.outboxMessage.create({
        data: {
          companyId: session.companyId,
          eventType: "PaymentVoided",
          payload: {
            salesOrderId: input.salesOrderId,
            paymentId: payment.id,
            reason: input.reason,
          },
        },
      });

      await this.audit.log({
        companyId: session.companyId,
        userId: session.userId,
        action: AuditAction.USER_UPDATED,
        entityName: "Payment",
        entityId: payment.id,
        details: { salesOrderId: input.salesOrderId, reason: input.reason, status: "VOIDED" },
      });

      return { voided: true };
    }, { maxWait: 10000, timeout: 30000 });
  }

  /**
   * Refund Payment (Full or Partial).
   */
  async refundPayment(session: UserSessionPayload, input: RefundPaymentInput) {
    const payment = await prisma.payment.findFirst({
      where: { id: input.paymentId, companyId: session.companyId },
      include: { invoice: { include: { creditNotes: true } } },
    });

    if (!payment) {
      throw new Error("Payment record not found or access denied");
    }

    if (input.amount <= 0) {
      throw new Error("Refund amount must be positive");
    }

    const existingRefunds = (payment.invoice.creditNotes || []).reduce((sum, cn) => sum + Number(cn.amount), 0);
    const maxRefundable = Number(payment.amount) - existingRefunds;

    if (input.amount > maxRefundable) {
      throw new Error(`Refund amount (${input.amount}) exceeds total captured payment amount (${payment.amount})`);
    }

    // Idempotency Check
    if (input.idempotencyKey) {
      const existingMsg = await prisma.outboxMessage.findFirst({
        where: {
          companyId: session.companyId,
          eventType: "PaymentRefunded",
          payload: { path: ["idempotencyKey"], equals: input.idempotencyKey },
        },
      });

      if (existingMsg) {
        const cnId = (existingMsg.payload as any)?.creditNoteId;
        const cn = await prisma.creditNote.findUnique({ where: { id: cnId } });
        if (cn) return cn;
      }
    }

    const gatewayRes = await this.provider.refund({
      captureId: payment.reference || payment.id,
      amount: input.amount,
      reason: input.reason,
      idempotencyKey: input.idempotencyKey,
    });

    if (!gatewayRes.success) {
      throw new Error("Gateway failed to execute refund");
    }

    return prisma.$transaction(async (tx) => {
      const cnNumber = `CN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const creditNote = await tx.creditNote.create({
        data: {
          invoiceId: payment.invoiceId,
          cnNumber,
          amount: input.amount,
          reason: input.reason || "Customer refund",
        },
      });

      await tx.outboxMessage.create({
        data: {
          companyId: session.companyId,
          eventType: "PaymentRefunded",
          payload: {
            salesOrderId: input.salesOrderId,
            invoiceId: payment.invoiceId,
            paymentId: payment.id,
            creditNoteId: creditNote.id,
            refundedAmount: input.amount,
            idempotencyKey: input.idempotencyKey,
          },
        },
      });

      await this.audit.log({
        companyId: session.companyId,
        userId: session.userId,
        action: AuditAction.USER_UPDATED,
        entityName: "CreditNote",
        entityId: creditNote.id,
        details: {
          salesOrderId: input.salesOrderId,
          invoiceId: payment.invoiceId,
          refundedAmount: input.amount,
          cnNumber,
        },
      });

      return creditNote;
    }, { maxWait: 10000, timeout: 30000 });
  }
}

export const orderPaymentService = new OrderPaymentService();

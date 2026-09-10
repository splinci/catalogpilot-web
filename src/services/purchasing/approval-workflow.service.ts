/**
 * ============================================================================
 * Atlas Commerce OS — Approval Workflow Domain Service
 * ============================================================================
 * Specification Reference: PUR-006 / BSD-004 / M5-001
 * Domain: Purchase Order Workflow Orchestration & Approvals
 * 
 * Responsibilities:
 * - Workflow orchestration for submit, approve, reject, send, close, cancel
 * - Integration with ApprovalWorkflowPolicy
 * - Transactional outbox event publishing for workflow states
 * - Security audit log recording
 * ============================================================================
 */

import { purchaseOrderRepository, PurchaseOrderRepository } from "@/repositories/purchase-order.repository";
import { approvalWorkflowPolicy, ApprovalWorkflowPolicy } from "./approval-workflow.policy";
import { auditService, AuditService } from "../audit.service";
import { UserSessionPayload } from "@/types/auth.dto";
import { AuditAction, POStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class ApprovalWorkflowService {
  constructor(
    private purchasingRepo: PurchaseOrderRepository = purchaseOrderRepository,
    private policy: ApprovalWorkflowPolicy = approvalWorkflowPolicy,
    private audit: AuditService = auditService
  ) {}

  /**
   * Submit Purchase Order for approval (DRAFT -> PENDING_APPROVAL)
   */
  async submitForApproval(session: UserSessionPayload, poId: string) {
    return this.executeTransition(session, poId, POStatus.PENDING_APPROVAL, "PurchaseOrderSubmitted");
  }

  /**
   * Approve Purchase Order (PENDING_APPROVAL -> APPROVED)
   */
  async approveOrder(session: UserSessionPayload, poId: string, comments?: string) {
    return this.executeTransition(session, poId, POStatus.APPROVED, "PurchaseOrderApproved", comments);
  }

  /**
   * Reject Purchase Order (PENDING_APPROVAL -> CANCELLED)
   */
  async rejectOrder(session: UserSessionPayload, poId: string, reason?: string) {
    if (!reason || reason.trim() === "") {
      throw new Error("A rejection reason is required to reject a Purchase Order");
    }
    return this.executeTransition(session, poId, POStatus.CANCELLED, "PurchaseOrderRejected", reason);
  }

  /**
   * Dispatch Purchase Order to Supplier (APPROVED -> SENT)
   */
  async sendToSupplier(session: UserSessionPayload, poId: string) {
    return this.executeTransition(session, poId, POStatus.SENT, "PurchaseOrderSent");
  }

  /**
   * Finalize/Close Purchase Order (RECEIVED -> CLOSED)
   */
  async closeOrder(session: UserSessionPayload, poId: string) {
    return this.executeTransition(session, poId, POStatus.CLOSED, "PurchaseOrderClosed");
  }

  /**
   * Cancel Purchase Order (DRAFT/PENDING_APPROVAL/APPROVED -> CANCELLED)
   */
  async cancelOrder(session: UserSessionPayload, poId: string, reason?: string) {
    return this.executeTransition(session, poId, POStatus.CANCELLED, "PurchaseOrderCancelled", reason);
  }

  /**
   * Core transition executor enforcing policies, outbox events, and audit logging.
   */
  private async executeTransition(
    session: UserSessionPayload,
    poId: string,
    targetStatus: POStatus,
    eventType: string,
    noteOrReason?: string
  ) {
    const po = await this.purchasingRepo.findById(session.companyId, poId);
    if (!po) {
      throw new Error("Purchase Order not found or access denied");
    }

    this.policy.validateTransition(po.status, targetStatus);

    await this.purchasingRepo.updateStatus(session.companyId, poId, targetStatus, session.userId);

    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType,
        payload: {
          poId,
          poNumber: po.poNumber,
          previousStatus: po.status,
          newStatus: targetStatus,
          actionBy: session.userId,
          noteOrReason,
          timestamp: new Date().toISOString(),
        },
      },
    });

    await this.audit.log({
      companyId: session.companyId,
      userId: session.userId,
      action: AuditAction.PO_APPROVED,
      entityName: "PurchaseOrder",
      entityId: poId,
      details: {
        poNumber: po.poNumber,
        previousStatus: po.status,
        newStatus: targetStatus,
        noteOrReason,
      },
    });

    return this.purchasingRepo.findById(session.companyId, poId);
  }
}

export const approvalWorkflowService = new ApprovalWorkflowService();

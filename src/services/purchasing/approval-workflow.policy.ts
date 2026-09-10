/**
 * ============================================================================
 * Atlas Commerce OS — Purchasing Approval Workflow Policy
 * ============================================================================
 * Specification Reference: PUR-006 / BSD-004 / M5-001
 * Domain: Purchase Order Approval Workflow & State Machine Engine
 * 
 * Responsibilities:
 * - Validate legal state machine transitions across PO statuses
 * - Prevent double approval, approving closed/cancelled/received orders
 * - Multi-stage threshold evaluation (single & multi-level ready)
 * ============================================================================
 */

import { POStatus } from "@prisma/client";

export class ApprovalWorkflowPolicy {
  /**
   * Validate if a Purchase Order can be submitted for approval.
   */
  canSubmit(currentStatus: POStatus): boolean {
    return currentStatus === POStatus.DRAFT;
  }

  /**
   * Validate if a Purchase Order can be approved.
   */
  canApprove(currentStatus: POStatus): boolean {
    return currentStatus === POStatus.DRAFT || currentStatus === POStatus.PENDING_APPROVAL;
  }

  /**
   * Validate if a Purchase Order can be rejected.
   */
  canReject(currentStatus: POStatus): boolean {
    return currentStatus === POStatus.PENDING_APPROVAL;
  }

  /**
   * Validate if a Purchase Order can be dispatched to supplier.
   */
  canSend(currentStatus: POStatus): boolean {
    return currentStatus === POStatus.APPROVED;
  }

  /**
   * Validate if a Purchase Order can be closed.
   */
  canClose(currentStatus: POStatus): boolean {
    return currentStatus === POStatus.RECEIVED || currentStatus === POStatus.PARTIALLY_RECEIVED;
  }

  /**
   * Validate if a Purchase Order can be cancelled.
   */
  canCancel(currentStatus: POStatus): boolean {
    return (
      currentStatus === POStatus.DRAFT ||
      currentStatus === POStatus.PENDING_APPROVAL ||
      currentStatus === POStatus.APPROVED
    );
  }

  /**
   * Validate legal state transition with descriptive domain exceptions.
   */
  validateTransition(currentStatus: POStatus, targetStatus: POStatus): void {
    if (currentStatus === targetStatus) {
      throw new Error(`Duplicate status transition rejected: Purchase Order is already in status '${currentStatus}'`);
    }

    if (currentStatus === POStatus.CLOSED || currentStatus === POStatus.CANCELLED) {
      throw new Error(`Workflow Exception: Cannot transition Purchase Order in finalized status '${currentStatus}'`);
    }

    switch (targetStatus) {
      case POStatus.PENDING_APPROVAL:
        if (!this.canSubmit(currentStatus)) {
          throw new Error(`Cannot submit Purchase Order for approval from status '${currentStatus}'`);
        }
        break;

      case POStatus.APPROVED:
        if (!this.canApprove(currentStatus)) {
          throw new Error(`Cannot approve Purchase Order currently in status '${currentStatus}'`);
        }
        break;

      case POStatus.SENT:
        if (!this.canSend(currentStatus)) {
          throw new Error(`Cannot send Purchase Order to supplier until it is APPROVED (current status: '${currentStatus}')`);
        }
        break;

      case POStatus.CLOSED:
        if (!this.canClose(currentStatus)) {
          throw new Error(`Cannot close Purchase Order until goods have been received (current status: '${currentStatus}')`);
        }
        break;

      case POStatus.CANCELLED:
        if (!this.canCancel(currentStatus)) {
          throw new Error(`Cannot cancel Purchase Order once goods receipt has commenced (status: '${currentStatus}')`);
        }
        break;

      default:
        break;
    }
  }
}

export const approvalWorkflowPolicy = new ApprovalWorkflowPolicy();

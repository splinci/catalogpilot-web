/**
 * ============================================================================
 * Atlas Commerce OS — Procurement Domain Policy
 * ============================================================================
 * Specification Reference: PUR-002 / BSD-004 / M5-001
 * Domain: Purchasing & Procurement
 * 
 * Responsibilities:
 * - Status state machine transition validation
 * - Business rule enforcement for PO approvals, receipts, and cancellations
 * - Remaining quantity over-receiving guards
 * ============================================================================
 */

import { POStatus } from "@prisma/client";

export class ProcurementPolicy {
  /**
   * Validate if a Purchase Order can be approved.
   */
  canApprove(status: POStatus): boolean {
    return status === POStatus.DRAFT || status === POStatus.PENDING_APPROVAL;
  }

  /**
   * Validate if a Purchase Order can receive goods.
   */
  canReceive(status: POStatus): boolean {
    return status === POStatus.SENT || status === POStatus.PARTIALLY_RECEIVED;
  }

  /**
   * Validate if a Purchase Order can be cancelled.
   */
  canCancel(status: POStatus): boolean {
    return status === POStatus.DRAFT || status === POStatus.PENDING_APPROVAL || status === POStatus.APPROVED;
  }

  /**
   * Validate legal PO status transition.
   */
  validateStatusTransition(currentStatus: POStatus, targetStatus: POStatus): void {
    if (currentStatus === targetStatus) return;

    if (currentStatus === POStatus.CLOSED || currentStatus === POStatus.CANCELLED) {
      throw new Error(`Cannot transition Purchase Order in finalized status '${currentStatus}'`);
    }

    if (targetStatus === POStatus.APPROVED && !this.canApprove(currentStatus)) {
      throw new Error(`Cannot approve Purchase Order currently in status '${currentStatus}'`);
    }

    if (targetStatus === POStatus.CANCELLED && !this.canCancel(currentStatus)) {
      throw new Error(`Cannot cancel Purchase Order in status '${currentStatus}'`);
    }
  }

  /**
   * Validate remaining line quantity to prevent over-receiving.
   */
  validateRemainingQuantity(orderedQty: number, previouslyReceivedQty: number, attemptingToReceiveQty: number): void {
    if (attemptingToReceiveQty <= 0) {
      throw new Error("Receiving quantity must be greater than zero");
    }

    const remainingQty = Math.max(0, orderedQty - previouslyReceivedQty);
    if (attemptingToReceiveQty > remainingQty) {
      throw new Error(
        `Over-receiving prohibited: Attempting to receive ${attemptingToReceiveQty} units, but remaining open quantity is ${remainingQty}`
      );
    }
  }
}

export const procurementPolicy = new ProcurementPolicy();

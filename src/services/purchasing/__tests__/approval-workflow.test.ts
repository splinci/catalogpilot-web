/**
 * ============================================================================
 * Atlas Commerce OS — Approval Workflow Test Suite
 * ============================================================================
 * Specification Reference: PUR-006 / TEST-001 / M5-001
 * Target System: ApprovalWorkflowPolicy & ApprovalWorkflowService
 * Coverage: State Transitions, Double Approval Protection, Rejection Validation
 * ============================================================================
 */

import { ApprovalWorkflowPolicy } from "../approval-workflow.policy";
import { POStatus } from "@prisma/client";

describe("PUR-006 Approval Workflow Test Suite", () => {
  const policy = new ApprovalWorkflowPolicy();

  describe("ApprovalWorkflowPolicy State Transitions", () => {
    it("should allow DRAFT -> PENDING_APPROVAL transition", () => {
      expect(() => policy.validateTransition(POStatus.DRAFT, POStatus.PENDING_APPROVAL)).not.toThrow();
    });

    it("should allow PENDING_APPROVAL -> APPROVED transition", () => {
      expect(() => policy.validateTransition(POStatus.PENDING_APPROVAL, POStatus.APPROVED)).not.toThrow();
    });

    it("should allow PENDING_APPROVAL -> CANCELLED transition (Rejection)", () => {
      expect(() => policy.validateTransition(POStatus.PENDING_APPROVAL, POStatus.CANCELLED)).not.toThrow();
    });

    it("should allow APPROVED -> SENT transition", () => {
      expect(() => policy.validateTransition(POStatus.APPROVED, POStatus.SENT)).not.toThrow();
    });

    it("should reject duplicate status transition (e.g. APPROVED -> APPROVED)", () => {
      expect(() => policy.validateTransition(POStatus.APPROVED, POStatus.APPROVED)).toThrow(
        "Duplicate status transition rejected: Purchase Order is already in status 'APPROVED'"
      );
    });

    it("should reject transition on finalized CLOSED status", () => {
      expect(() => policy.validateTransition(POStatus.CLOSED, POStatus.APPROVED)).toThrow(
        "Workflow Exception: Cannot transition Purchase Order in finalized status 'CLOSED'"
      );
    });

    it("should reject transition on finalized CANCELLED status", () => {
      expect(() => policy.validateTransition(POStatus.CANCELLED, POStatus.APPROVED)).toThrow(
        "Workflow Exception: Cannot transition Purchase Order in finalized status 'CANCELLED'"
      );
    });

    it("should reject sending unapproved DRAFT order to supplier", () => {
      expect(() => policy.validateTransition(POStatus.DRAFT, POStatus.SENT)).toThrow(
        "Cannot send Purchase Order to supplier until it is APPROVED (current status: 'DRAFT')"
      );
    });
  });
});

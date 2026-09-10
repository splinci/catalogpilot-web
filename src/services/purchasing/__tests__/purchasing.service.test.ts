/**
 * ============================================================================
 * Atlas Commerce OS — Purchasing Service Layer Unit Test Suite
 * ============================================================================
 * Specification Reference: PUR-002 / TEST-001 / M5-001
 * Target Services & Policies: ProcurementPolicy, InventoryIntegrationPolicy, PurchaseOrderService
 * Coverage: Policy Validation, Over-Receiving Prevention, Status Transitions
 * ============================================================================
 */

import { ProcurementPolicy } from "../procurement.policy";
import { InventoryIntegrationPolicy } from "../inventory-integration.policy";
import { POStatus } from "@prisma/client";

describe("PUR-002 Purchasing Service & Policy Unit Test Suite", () => {
  const policy = new ProcurementPolicy();
  const integrationPolicy = new InventoryIntegrationPolicy();

  describe("ProcurementPolicy Status Validation", () => {
    it("should allow approval only for DRAFT and PENDING_APPROVAL status", () => {
      expect(policy.canApprove(POStatus.DRAFT)).toBe(true);
      expect(policy.canApprove(POStatus.PENDING_APPROVAL)).toBe(true);
      expect(policy.canApprove(POStatus.APPROVED)).toBe(false);
      expect(policy.canApprove(POStatus.RECEIVED)).toBe(false);
    });

    it("should allow goods receipt only for SENT and PARTIALLY_RECEIVED status", () => {
      expect(policy.canReceive(POStatus.SENT)).toBe(true);
      expect(policy.canReceive(POStatus.PARTIALLY_RECEIVED)).toBe(true);
      expect(policy.canReceive(POStatus.DRAFT)).toBe(false);
      expect(policy.canReceive(POStatus.CLOSED)).toBe(false);
    });

    it("should prevent invalid status transition on finalized orders", () => {
      expect(() =>
        policy.validateStatusTransition(POStatus.CLOSED, POStatus.APPROVED)
      ).toThrow("Cannot transition Purchase Order in finalized status 'CLOSED'");
    });

    it("should throw over-receiving exception when receiving quantity exceeds remaining open quantity", () => {
      expect(() =>
        policy.validateRemainingQuantity(100, 80, 30)
      ).toThrow("Over-receiving prohibited: Attempting to receive 30 units, but remaining open quantity is 20");
    });
  });

  describe("InventoryIntegrationPolicy Validation", () => {
    it("should throw exception when warehouse ID is missing", () => {
      expect(() => integrationPolicy.validateWarehouse("")).toThrow("Target warehouse ID is required for goods receiving");
    });

    it("should validate valid receiving payload cleanly", () => {
      const payload = [{ productId: "prod_1", receivedQty: 10, warehouseId: "wh_1" }];
      expect(() => integrationPolicy.validateReceivingPayload(payload)).not.toThrow();
    });
  });
});

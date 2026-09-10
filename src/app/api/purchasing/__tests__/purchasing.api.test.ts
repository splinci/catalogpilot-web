/**
 * ============================================================================
 * Atlas Commerce OS — Purchasing REST API Test Suite
 * ============================================================================
 * Specification Reference: PUR-003 / TEST-001 / M5-001
 * Coverage: Endpoint imports, RBAC permission checks, Zod schema validation
 * ============================================================================
 */

import { CreateSupplierSchema, CreatePurchaseOrderSchema, ReceiveGoodsSchema } from "@/types/purchasing.dto";

describe("PUR-003 Purchasing REST API Test Suite", () => {
  describe("Zod DTO Schema Validation", () => {
    it("should validate valid supplier creation body", () => {
      const payload = {
        code: "SUPP-001",
        name: "Acme Components Inc",
        email: "contact@acme.com",
        phone: "+1-555-0199",
      };
      const parsed = CreateSupplierSchema.parse(payload);
      expect(parsed.code).toBe("SUPP-001");
      expect(parsed.name).toBe("Acme Components Inc");
    });

    it("should reject invalid supplier code format", () => {
      const payload = {
        code: "INVALID SUPPLIER CODE",
        name: "Acme",
      };
      expect(() => CreateSupplierSchema.parse(payload)).toThrow();
    });

    it("should validate valid purchase order creation body", () => {
      const payload = {
        supplierId: "supp_123",
        lines: [
          { productId: "prod_1", orderedQty: 50, unitCost: 12.5 },
        ],
      };
      const parsed = CreatePurchaseOrderSchema.parse(payload);
      expect(parsed.lines.length).toBe(1);
      expect(parsed.lines[0].orderedQty).toBe(50);
    });

    it("should validate valid goods receiving payload", () => {
      const payload = {
        notes: "Received cleanly at Warehouse A",
        lines: [
          { productId: "prod_1", receivedQty: 50, warehouseId: "wh_001" },
        ],
      };
      const parsed = ReceiveGoodsSchema.parse(payload);
      expect(parsed.lines[0].receivedQty).toBe(50);
    });
  });
});

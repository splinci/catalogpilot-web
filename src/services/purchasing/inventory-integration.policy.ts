/**
 * ============================================================================
 * Atlas Commerce OS — Inventory Integration Policy
 * ============================================================================
 * Specification Reference: PUR-002 / BSD-004 / M5-001
 * Domain: Purchasing & Procurement Integration with WMS
 * 
 * Responsibilities:
 * - Validate warehouse destination and bin parameters
 * - Validate receiving quantities against stock ledger rules
 * ============================================================================
 */

export class InventoryIntegrationPolicy {
  /**
   * Validate destination warehouse ID.
   */
  validateWarehouse(warehouseId: string): void {
    if (!warehouseId || warehouseId.trim() === "") {
      throw new Error("Target warehouse ID is required for goods receiving");
    }
  }

  /**
   * Validate stock update payload invariants.
   */
  validateReceivingPayload(lines: { productId: string; receivedQty: number; warehouseId: string }[]): void {
    if (!lines || lines.length === 0) {
      throw new Error("Goods receipt payload must contain at least one line item");
    }

    for (const line of lines) {
      this.validateWarehouse(line.warehouseId);
      if (line.receivedQty <= 0) {
        throw new Error(`Invalid receiving quantity ${line.receivedQty} for product '${line.productId}'`);
      }
    }
  }
}

export const inventoryIntegrationPolicy = new InventoryIntegrationPolicy();

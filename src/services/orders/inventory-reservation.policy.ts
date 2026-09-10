/**
 * ============================================================================
 * Atlas Commerce OS — Inventory Reservation Policy Engine
 * ============================================================================
 * Specification Reference: ORD-002 / BSD-005 / M6-001
 * Domain: Stock Reservation Availability Verification
 * 
 * Responsibilities:
 * - Validate available stock against requested order quantities
 * - Prevent negative available stock allocation
 * ============================================================================
 */

export class InventoryReservationPolicy {
  /**
   * Validate that available unreserved stock is sufficient.
   */
  validateAvailability(productSkuOrTitle: string, availableQty: number, requestedQty: number): void {
    if (requestedQty <= 0) {
      throw new Error(`Requested reservation quantity must be positive (received: ${requestedQty})`);
    }

    if (availableQty < requestedQty) {
      throw new Error(
        `Insufficient available stock for '${productSkuOrTitle}': Requested ${requestedQty} units, but only ${availableQty} units available`
      );
    }
  }
}

export const inventoryReservationPolicy = new InventoryReservationPolicy();

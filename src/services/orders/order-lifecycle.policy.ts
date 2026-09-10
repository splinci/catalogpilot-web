/**
 * ============================================================================
 * Atlas Commerce OS — Order Lifecycle Policy Engine
 * ============================================================================
 * Specification Reference: ORD-002 / BSD-005 / M6-001
 * Domain: Sales Order State Machine Validation Rules
 * 
 * Responsibilities:
 * - Validate legal state transitions across OrderStatus values
 * - Prevent state transitions on finalized (COMPLETED/CANCELLED) orders
 * ============================================================================
 */

import { OrderStatus } from "@prisma/client";

export class OrderLifecyclePolicy {
  /**
   * Validate if order can be confirmed.
   */
  canConfirm(currentStatus: OrderStatus): boolean {
    return currentStatus === OrderStatus.DRAFT || currentStatus === OrderStatus.PENDING_APPROVAL;
  }

  /**
   * Validate if picking can begin.
   */
  canStartPicking(currentStatus: OrderStatus): boolean {
    return currentStatus === OrderStatus.CONFIRMED || currentStatus === OrderStatus.RESERVED;
  }

  /**
   * Validate if order can be packed.
   */
  canPack(currentStatus: OrderStatus): boolean {
    return currentStatus === OrderStatus.PICKING;
  }

  /**
   * Validate if order can be shipped.
   */
  canShip(currentStatus: OrderStatus): boolean {
    return (
      currentStatus === OrderStatus.PACKING ||
      currentStatus === OrderStatus.RESERVED ||
      currentStatus === OrderStatus.CONFIRMED
    );
  }

  /**
   * Validate if delivery can be confirmed.
   */
  canDeliver(currentStatus: OrderStatus): boolean {
    return currentStatus === OrderStatus.SHIPPED;
  }

  /**
   * Validate if order can be cancelled.
   */
  canCancel(currentStatus: OrderStatus): boolean {
    return (
      currentStatus === OrderStatus.DRAFT ||
      currentStatus === OrderStatus.PENDING_APPROVAL ||
      currentStatus === OrderStatus.CONFIRMED ||
      currentStatus === OrderStatus.RESERVED
    );
  }

  /**
   * Validate legal state transition with descriptive domain exceptions.
   */
  validateTransition(currentStatus: OrderStatus, targetStatus: OrderStatus): void {
    if (currentStatus === targetStatus) {
      throw new Error(`Duplicate status transition rejected: Sales Order is already in status '${currentStatus}'`);
    }

    if (currentStatus === OrderStatus.COMPLETED || currentStatus === OrderStatus.CANCELLED) {
      throw new Error(`Order Lifecycle Exception: Cannot transition Sales Order in finalized status '${currentStatus}'`);
    }

    switch (targetStatus) {
      case OrderStatus.CONFIRMED:
        if (!this.canConfirm(currentStatus)) {
          throw new Error(`Cannot confirm Sales Order currently in status '${currentStatus}'`);
        }
        break;

      case OrderStatus.PICKING:
        if (!this.canStartPicking(currentStatus)) {
          throw new Error(`Cannot start picking for Sales Order currently in status '${currentStatus}'`);
        }
        break;

      case OrderStatus.PACKING:
        if (!this.canPack(currentStatus)) {
          throw new Error(`Cannot pack Sales Order currently in status '${currentStatus}'`);
        }
        break;

      case OrderStatus.SHIPPED:
        if (!this.canShip(currentStatus)) {
          throw new Error(`Cannot ship Sales Order currently in status '${currentStatus}'`);
        }
        break;

      case OrderStatus.DELIVERED:
        if (!this.canDeliver(currentStatus)) {
          throw new Error(`Cannot mark Sales Order as delivered currently in status '${currentStatus}'`);
        }
        break;

      case OrderStatus.CANCELLED:
        if (!this.canCancel(currentStatus)) {
          throw new Error(`Cannot cancel Sales Order once shipment dispatch has commenced (status: '${currentStatus}')`);
        }
        break;

      default:
        break;
    }
  }
}

export const orderLifecyclePolicy = new OrderLifecyclePolicy();

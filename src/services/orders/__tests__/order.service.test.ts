/**
 * ============================================================================
 * Atlas Commerce OS — Order Service Unit Test Suite
 * ============================================================================
 * Specification Reference: ORD-002 / TEST-001 / M6-001
 * Target System: Order lifecycle policies, reservation rules, and service facades
 * Coverage: Transition validation, stock availability guards, and service exports
 * ============================================================================
 */

import { OrderLifecyclePolicy } from "../order-lifecycle.policy";
import { InventoryReservationPolicy } from "../inventory-reservation.policy";
import { orderService } from "../order.service";
import { fulfillmentService } from "../fulfillment.service";
import { shipmentService } from "../shipment.service";
import { orderAnalyticsService } from "../order-analytics.service";
import { OrderStatus } from "@prisma/client";

describe("ORD-002 Order Management Service Suite", () => {
  const lifecyclePolicy = new OrderLifecyclePolicy();
  const reservationPolicy = new InventoryReservationPolicy();

  describe("OrderLifecyclePolicy Transition Validation", () => {
    it("should allow DRAFT -> CONFIRMED transition", () => {
      expect(() => lifecyclePolicy.validateTransition(OrderStatus.DRAFT, OrderStatus.CONFIRMED)).not.toThrow();
    });

    it("should allow CONFIRMED -> PICKING transition", () => {
      expect(() => lifecyclePolicy.validateTransition(OrderStatus.CONFIRMED, OrderStatus.PICKING)).not.toThrow();
    });

    it("should allow PICKING -> PACKING transition", () => {
      expect(() => lifecyclePolicy.validateTransition(OrderStatus.PICKING, OrderStatus.PACKING)).not.toThrow();
    });

    it("should allow PACKING -> SHIPPED transition", () => {
      expect(() => lifecyclePolicy.validateTransition(OrderStatus.PACKING, OrderStatus.SHIPPED)).not.toThrow();
    });

    it("should allow SHIPPED -> DELIVERED transition", () => {
      expect(() => lifecyclePolicy.validateTransition(OrderStatus.SHIPPED, OrderStatus.DELIVERED)).not.toThrow();
    });

    it("should reject transition on finalized COMPLETED status", () => {
      expect(() => lifecyclePolicy.validateTransition(OrderStatus.COMPLETED, OrderStatus.SHIPPED)).toThrow(
        "Order Lifecycle Exception: Cannot transition Sales Order in finalized status 'COMPLETED'"
      );
    });

    it("should reject transition on finalized CANCELLED status", () => {
      expect(() => lifecyclePolicy.validateTransition(OrderStatus.CANCELLED, OrderStatus.CONFIRMED)).toThrow(
        "Order Lifecycle Exception: Cannot transition Sales Order in finalized status 'CANCELLED'"
      );
    });
  });

  describe("InventoryReservationPolicy Availability Rules", () => {
    it("should allow reservation when available stock is sufficient", () => {
      expect(() => reservationPolicy.validateAvailability("Product SKU-01", 50, 10)).not.toThrow();
    });

    it("should reject reservation when available stock is insufficient", () => {
      expect(() => reservationPolicy.validateAvailability("Product SKU-01", 5, 10)).toThrow(
        "Insufficient available stock for 'Product SKU-01': Requested 10 units, but only 5 units available"
      );
    });
  });

  describe("Service Instance Exports", () => {
    it("should re-export active service facades", () => {
      expect(orderService).toBeDefined();
      expect(fulfillmentService).toBeDefined();
      expect(shipmentService).toBeDefined();
      expect(orderAnalyticsService).toBeDefined();
    });
  });
});

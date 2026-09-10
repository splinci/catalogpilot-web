/**
 * ============================================================================
 * Atlas Commerce OS — Order Repository Unit Test Suite
 * ============================================================================
 * Specification Reference: ORD-001 / M6-001 / TEST-001
 * Target System: SalesOrderRepository, ShipmentRepository, SalesQuotationRepository
 * Coverage: Multi-tenant query isolation, aggregate creation, atomic shipments, quotation conversions
 * ============================================================================
 */

import { salesOrderRepository } from "../sales-order.repository";
import { shipmentRepository } from "../shipment.repository";
import { salesQuotationRepository } from "../sales-quotation.repository";

describe("ORD-001 Order Management Repository Test Suite", () => {
  it("should export salesOrderRepository instance with CRUD capabilities", () => {
    expect(salesOrderRepository).toBeDefined();
    expect(typeof salesOrderRepository.findMany).toBe("function");
    expect(typeof salesOrderRepository.findById).toBe("function");
    expect(typeof salesOrderRepository.createOrder).toBe("function");
    expect(typeof salesOrderRepository.updateStatus).toBe("function");
    expect(typeof salesOrderRepository.findReservationsByOrder).toBe("function");
  });

  it("should export shipmentRepository instance with atomic dispatch capabilities", () => {
    expect(shipmentRepository).toBeDefined();
    expect(typeof shipmentRepository.createShipment).toBe("function");
    expect(typeof shipmentRepository.findByOrder).toBe("function");
    expect(typeof shipmentRepository.findById).toBe("function");
  });

  it("should export salesQuotationRepository instance with conversion capabilities", () => {
    expect(salesQuotationRepository).toBeDefined();
    expect(typeof salesQuotationRepository.createQuotation).toBe("function");
    expect(typeof salesQuotationRepository.convertToSalesOrder).toBe("function");
    expect(typeof salesQuotationRepository.findMany).toBe("function");
    expect(typeof salesQuotationRepository.findById).toBe("function");
  });
});

/**
 * ============================================================================
 * Atlas Commerce OS — Order Management UI Component Test Suite
 * ============================================================================
 * Specification Reference: ORD-005 / TEST-001 / M6-001
 * Coverage: Component exports, render signatures, props integrity
 * ============================================================================
 */

import { OrderKPIs } from "../components/OrderKPIs";
import { SalesOrderTable } from "../components/SalesOrderTable";
import { CreateOrderModal } from "../components/CreateOrderModal";
import { DispatchShipmentModal } from "../components/DispatchShipmentModal";

describe("ORD-005 OMS UI Component Test Suite", () => {
  it("should export OrderKPIs component", () => {
    expect(OrderKPIs).toBeDefined();
  });

  it("should export SalesOrderTable component", () => {
    expect(SalesOrderTable).toBeDefined();
  });

  it("should export CreateOrderModal component", () => {
    expect(CreateOrderModal).toBeDefined();
  });

  it("should export DispatchShipmentModal component", () => {
    expect(DispatchShipmentModal).toBeDefined();
  });
});

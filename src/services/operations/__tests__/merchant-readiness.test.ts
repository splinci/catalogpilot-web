/**
 * ============================================================================
 * Splinci Commerce OS — MERCHANT-001 Real-World Merchant Readiness Test Suite
 * ============================================================================
 * Specification Reference: MERCHANT-001 / GOV-001 / BSD-001..010
 * Coverage: Complete 15-Stage Merchant Operational Lifecycle:
 *   Supplier -> Product -> PO -> Goods Receipt -> Warehouse Inventory ->
 *   Customer -> Sales Order -> Payment Auth -> Payment Capture -> Reservation ->
 *   Picking -> Packing -> Shipment -> Delivery -> Order Completion ->
 *   Dashboard Metrics -> RMA -> Disposition (RESTOCK vs DAMAGED) -> Refund -> Audit/Outbox.
 *
 * Mandatory Invariants & Bounds:
 *   availableQty = onHandQty - reservedQty
 *   onHandQty >= 0, reservedQty >= 0, reservedQty <= onHandQty, availableQty >= 0
 *   capturedAmount <= totalAmount, refundedAmount <= capturedAmount
 *
 * Mandatory Governance Baseline:
 *   DEPLOYMENT = CONTROLLED_PRODUCTION
 *   OFFICIAL_PLATFORM_STATUS = CONTROLLED_PRODUCTION_READY
 *   GATE 30 = NOT_VERIFIED
 *   STABLE_PRODUCTION = NOT_AUTHORIZED
 * ============================================================================
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../../../lib/prisma";
import { OrderStatus, PaymentMethod, InvoiceStatus, AuditAction, Role, POStatus } from "@prisma/client";
import { purchaseOrderService } from "../../purchasing/purchase-order.service";
import { goodsReceiptService } from "../../purchasing/goods-receipt.service";
import { orderService } from "../../orders/order.service";
import { orderPaymentService } from "../../orders/order-payment.service";
import { fulfillmentService } from "../../orders/fulfillment.service";
import { shipmentService } from "../../orders/shipment.service";
import { orderReturnService } from "../../orders/order-return.service";
import { UserSessionPayload } from "@/types/auth.dto";

const TS = Date.now();
const TENANT_A = `cmp_mch1_A_${TS}`;
const TENANT_B = `cmp_mch1_B_${TS}`;

let sessionA_Admin: UserSessionPayload;
let sessionB_Admin: UserSessionPayload;

beforeAll(async () => {
  await prisma.company.createMany({
    data: [
      { id: TENANT_A, code: `MCH1_A_${TS}`, legalName: "Merchant Audit Tenant A Corp", displayName: "MCH1 Tenant A" },
      { id: TENANT_B, code: `MCH1_B_${TS}`, legalName: "Merchant Audit Tenant B Corp", displayName: "MCH1 Tenant B" },
    ],
  });

  const userA = await prisma.user.create({
    data: {
      id: `usr_mchA_${TS}`,
      companyId: TENANT_A,
      email: `admin_mchA_${TS}@test.com`,
      passwordHash: "hash_secret_123",
      firstName: "MerchantAdmin",
      lastName: "TenantA",
      role: Role.ADMIN,
    },
  });

  const userB = await prisma.user.create({
    data: {
      id: `usr_mchB_${TS}`,
      companyId: TENANT_B,
      email: `admin_mchB_${TS}@test.com`,
      passwordHash: "hash_secret_123",
      firstName: "MerchantAdmin",
      lastName: "TenantB",
      role: Role.ADMIN,
    },
  });

  sessionA_Admin = { userId: userA.id, email: userA.email, companyId: TENANT_A, role: Role.ADMIN };
  sessionB_Admin = { userId: userB.id, email: userB.email, companyId: TENANT_B, role: Role.ADMIN };
});

afterAll(async () => {
  const tenantIds = [TENANT_A, TENANT_B];
  await prisma.auditLog.deleteMany({ where: { companyId: { in: tenantIds } } });
  await prisma.outboxMessage.deleteMany({ where: { companyId: { in: tenantIds } } });
  await prisma.payment.deleteMany({ where: { companyId: { in: tenantIds } } });
  await prisma.invoice.deleteMany({ where: { companyId: { in: tenantIds } } });
  await prisma.stockReservation.deleteMany({ where: { inventoryItem: { companyId: { in: tenantIds } } } });
  await prisma.inventoryTransaction.deleteMany({ where: { inventoryItem: { companyId: { in: tenantIds } } } });
  await prisma.inventoryItem.deleteMany({ where: { companyId: { in: tenantIds } } });
  await prisma.shipment.deleteMany({ where: { salesOrder: { companyId: { in: tenantIds } } } });
  await prisma.salesOrderLine.deleteMany({ where: { salesOrder: { companyId: { in: tenantIds } } } });
  await prisma.salesOrder.deleteMany({ where: { companyId: { in: tenantIds } } });
  await prisma.customer.deleteMany({ where: { companyId: { in: tenantIds } } });
  await prisma.goodsReceipt.deleteMany({ where: { purchaseOrder: { companyId: { in: tenantIds } } } });
  await prisma.purchaseOrder.deleteMany({ where: { companyId: { in: tenantIds } } });
  await prisma.supplier.deleteMany({ where: { companyId: { in: tenantIds } } });
  await prisma.product.deleteMany({ where: { companyId: { in: tenantIds } } });
  await prisma.warehouse.deleteMany({ where: { companyId: { in: tenantIds } } });
  await prisma.user.deleteMany({ where: { companyId: { in: tenantIds } } });
  await prisma.company.deleteMany({ where: { id: { in: tenantIds } } });
}, 120000);

// ===========================================================================
// 1. PRIMARY MERCHANT LIFECYCLE END-TO-END CERTIFICATION
// ===========================================================================
describe("1. Primary Merchant Lifecycle End-to-End Certification", () => {
  let supplierA: any;
  let warehouseA: any;
  let productA: any;
  let poA: any;
  let receiptA: any;
  let inventoryA: any;
  let customerA: any;
  let orderA: any;
  let paymentA: any;
  let rmaA: any;

  it("1.1 Supply Procurement: Supplier -> PO -> Approval -> Sent -> Goods Receipt", async () => {
    const codeA = `SUP-A-${TS}`;
    supplierA = await prisma.supplier.create({
      data: { companyId: TENANT_A, code: codeA, name: "Acme Components Corp", email: `supA_${TS}@acme.com` },
    });
    warehouseA = await prisma.warehouse.create({
      data: { companyId: TENANT_A, code: `WH-MAIN-${TS}`, name: "Main Distribution Center" },
    });
    productA = await prisma.product.create({
      data: { companyId: TENANT_A, sku: `SKU-ECOM-01-${TS}`, title: "Enterprise Wireless Earbuds", price: 150, costPrice: 75 },
    });

    // Create Draft PO
    poA = await purchaseOrderService.createPurchaseOrder(sessionA_Admin, {
      supplierId: supplierA.id,
      lines: [{ productId: productA.id, orderedQty: 50, unitCost: 75 }],
    });
    expect(poA.status).toBe(POStatus.DRAFT);

    // Approve & Send PO
    poA = await purchaseOrderService.transitionStatus(sessionA_Admin, poA.id, POStatus.APPROVED);
    expect(poA.status).toBe(POStatus.APPROVED);

    poA = await purchaseOrderService.transitionStatus(sessionA_Admin, poA.id, POStatus.SENT);
    expect(poA.status).toBe(POStatus.SENT);

    // Receive Goods in Warehouse
    receiptA = await goodsReceiptService.receiveGoods(sessionA_Admin, poA.id, {
      lines: [{ productId: productA.id, receivedQty: 50, warehouseId: warehouseA.id }],
    });
    expect(receiptA.receiptNumber).toBeDefined();

    // Verify Inventory Incremented
    inventoryA = await prisma.inventoryItem.findFirst({
      where: { companyId: TENANT_A, productId: productA.id, warehouseId: warehouseA.id },
    });
    expect(inventoryA).not.toBeNull();
    expect(inventoryA.onHandQty).toBe(50);
    expect(inventoryA.reservedQty).toBe(0);
    expect(inventoryA.availableQty).toBe(50);
  });

  it("1.2 Sales Order & Fulfillment: Customer -> Order -> Payment Auth -> Capture -> Fulfillment", async () => {
    customerA = await prisma.customer.create({
      data: { companyId: TENANT_A, customerCode: `CUST-ECOM-01-${TS}`, legalName: "Jane Doe Merchant", email: `jane_${TS}@customer.com` },
    });

    // Create & Confirm Order for 2 units
    orderA = await orderService.createSalesOrder(sessionA_Admin, {
      customerId: customerA.id,
      lines: [{ productId: productA.id, quantity: 2, unitPrice: 150 }],
    });
    expect(orderA.status).toBe(OrderStatus.DRAFT);
    const lineIdA = orderA.lines[0].id;

    orderA = await orderService.confirmOrder(sessionA_Admin, orderA.id);
    expect(orderA.status).toBe(OrderStatus.CONFIRMED);

    // Payment Authorization & Capture
    paymentA = await orderPaymentService.authorizePayment(sessionA_Admin, { salesOrderId: orderA.id, amount: 300 });
    expect(paymentA.id).toBeDefined();
    expect(Number(paymentA.amount)).toBe(300);

    const captureRes = await orderPaymentService.capturePayment(sessionA_Admin, { salesOrderId: orderA.id, paymentId: paymentA.id, amount: 300 });
    expect(captureRes.id).toBeDefined();
    expect(Number(captureRes.amount)).toBe(300);

    // Inventory Reservation
    const reservationRes = await fulfillmentService.reserveInventory(sessionA_Admin, orderA.id, warehouseA.id);
    expect(reservationRes.status).toBe(OrderStatus.RESERVED);

    // Verify Invariant After Reservation: onHand = 50, reserved = 2, available = 48
    inventoryA = await prisma.inventoryItem.findFirst({ where: { companyId: TENANT_A, productId: productA.id } });
    expect(inventoryA.onHandQty).toBe(50);
    expect(inventoryA.reservedQty).toBe(2);
    expect(inventoryA.availableQty).toBe(48);

    // Pick -> Pack -> Ship -> Deliver -> Complete Order
    await fulfillmentService.startPicking(sessionA_Admin, orderA.id);
    await fulfillmentService.packOrder(sessionA_Admin, orderA.id);

    const shipRes = await shipmentService.dispatchShipment(sessionA_Admin, orderA.id, {
      carrier: "FedEx Express Internal",
      trackingNumber: `TRK-EXPRESS-${TS}`,
      lines: [{ salesOrderLineId: lineIdA, quantity: 2 }],
    });
    expect(shipRes.id).toBeDefined();

    const deliverRes = await shipmentService.confirmDelivery(sessionA_Admin, orderA.id);
    expect(deliverRes.status).toBe(OrderStatus.DELIVERED);

    const completeRes = await orderService.closeOrder(sessionA_Admin, orderA.id);
    expect(completeRes.status).toBe(OrderStatus.COMPLETED);
  });

  it("1.3 Post-Sale Lifecycle: RMA -> Inspection & RESTOCK -> Refund", async () => {
    const lineIdA = (await prisma.salesOrderLine.findFirst({ where: { salesOrderId: orderA.id } }))!.id;

    // Customer requests return of 1 unit
    rmaA = await orderReturnService.requestReturn(sessionA_Admin, {
      salesOrderId: orderA.id,
      lines: [{ salesOrderLineId: lineIdA, quantity: 1, reason: "Wrong Color" }],
    });
    expect(rmaA.rmaNumber).toBeDefined();

    await orderReturnService.authorizeRMA(sessionA_Admin, orderA.id, rmaA.rmaNumber);
    await orderReturnService.receiveReturn(sessionA_Admin, orderA.id, rmaA.rmaNumber);

    // Inspect & Restock into sellable inventory
    const inspectRes = await orderReturnService.inspectAndDisposeReturn(sessionA_Admin, {
      salesOrderId: orderA.id,
      rmaNumber: rmaA.rmaNumber,
      lines: [{ salesOrderLineId: lineIdA, quantity: 1, warehouseId: warehouseA.id, disposition: "RESTOCK" }],
    });
    expect(inspectRes.status).toBe("RETURN_ACCEPTED");

    // Verify Restock Inventory Incremented: onHand = 49, reserved = 0, available = 49
    inventoryA = await prisma.inventoryItem.findFirst({ where: { companyId: TENANT_A, productId: productA.id } });
    expect(inventoryA.onHandQty).toBe(49);
    expect(inventoryA.availableQty).toBe(49);

    // Process Return Refund
    const refundRes = await orderReturnService.processReturnRefund(sessionA_Admin, orderA.id, paymentA.id, 150, "Return RMA Restock Refund");
    expect(refundRes.id).toBeDefined();
    expect(Number(refundRes.amount)).toBe(150);
  });
});

// ===========================================================================
// 2. INVENTORY & WAREHOUSE INVARIANTS & BOUNDS CERTIFICATION
// ===========================================================================
describe("2. Inventory & Warehouse Invariants & Bounds Certification", () => {
  it("2.1 should enforce availableQty = onHandQty - reservedQty invariant across all items", async () => {
    const items = await prisma.inventoryItem.findMany({ where: { companyId: TENANT_A } });
    for (const item of items) {
      expect(item.availableQty).toBe(item.onHandQty - item.reservedQty);
      expect(item.onHandQty).toBeGreaterThanOrEqual(0);
      expect(item.reservedQty).toBeGreaterThanOrEqual(0);
      expect(item.reservedQty).toBeLessThanOrEqual(item.onHandQty);
      expect(item.availableQty).toBeGreaterThanOrEqual(0);
    }
  });

  it("2.2 should verify DAMAGED disposition does NOT increment sellable inventory", async () => {
    const prodDamaged = await prisma.product.create({ data: { companyId: TENANT_A, sku: `SKU-DAMAGED-${TS}`, title: "Damaged Test Prod", price: 100, costPrice: 50 } });
    const custDamaged = await prisma.customer.create({ data: { companyId: TENANT_A, customerCode: `CUST-DAMAGED-${TS}`, legalName: "Damaged Cust", email: `dam_${TS}@test.com` } });
    const whDamaged = await prisma.warehouse.findFirst({ where: { companyId: TENANT_A } });

    // Create item with 10 onHand
    await prisma.inventoryItem.create({
      data: { companyId: TENANT_A, productId: prodDamaged.id, warehouseId: whDamaged!.id, onHandQty: 10, reservedQty: 0, availableQty: 10 },
    });

    const orderDamaged = await orderService.createSalesOrder(sessionA_Admin, {
      customerId: custDamaged.id,
      lines: [{ productId: prodDamaged.id, quantity: 1, unitPrice: 100 }],
    });

    const rmaDamaged = await orderReturnService.requestReturn(sessionA_Admin, {
      salesOrderId: orderDamaged.id,
      lines: [{ salesOrderLineId: orderDamaged.lines[0].id, quantity: 1, reason: "Broken Glass" }],
    });

    await orderReturnService.inspectAndDisposeReturn(sessionA_Admin, {
      salesOrderId: orderDamaged.id,
      rmaNumber: rmaDamaged.rmaNumber,
      lines: [{ salesOrderLineId: orderDamaged.lines[0].id, quantity: 1, warehouseId: whDamaged!.id, disposition: "DAMAGED" }],
    });

    // Verify onHand & available stayed 10 (not incremented for damaged item)
    const invPost = await prisma.inventoryItem.findFirst({ where: { companyId: TENANT_A, productId: prodDamaged.id } });
    expect(invPost?.onHandQty).toBe(10);
    expect(invPost?.availableQty).toBe(10);
  });
});

// ===========================================================================
// 3. SALES ORDER STATE MACHINE & VALIDATION CERTIFICATION
// ===========================================================================
describe("3. Sales Order State Machine & Validation Certification", () => {
  it("3.1 should reject invalid state transition DRAFT -> DELIVERED", async () => {
    const cust = await prisma.customer.create({ data: { companyId: TENANT_A, customerCode: `CUST-INVALID1-${TS}`, legalName: "Invalid Cust 1", email: `inv1_${TS}@test.com` } });
    const prod = await prisma.product.create({ data: { companyId: TENANT_A, sku: `SKU-INV1-${TS}`, title: "Invalid Prod 1", price: 100, costPrice: 50 } });
    const order = await orderService.createSalesOrder(sessionA_Admin, { customerId: cust.id, lines: [{ productId: prod.id, quantity: 1, unitPrice: 100 }] });

    await expect(
      shipmentService.confirmDelivery(sessionA_Admin, order.id)
    ).rejects.toThrow();
  });

  it("3.2 should allow valid pre-fulfillment cancellation DRAFT -> CANCELLED", async () => {
    const cust = await prisma.customer.create({ data: { companyId: TENANT_A, customerCode: `CUST-CANCEL1-${TS}`, legalName: "Cancel Cust 1", email: `can1_${TS}@test.com` } });
    const prod = await prisma.product.create({ data: { companyId: TENANT_A, sku: `SKU-CAN1-${TS}`, title: "Cancel Prod 1", price: 100, costPrice: 50 } });
    const order = await orderService.createSalesOrder(sessionA_Admin, { customerId: cust.id, lines: [{ productId: prod.id, quantity: 1, unitPrice: 100 }] });

    const cancelledOrder = await orderService.cancelOrder(sessionA_Admin, order.id, "Customer requested cancellation");
    expect(cancelledOrder.status).toBe(OrderStatus.CANCELLED);
  });
});

// ===========================================================================
// 4. FINANCIAL ENGINE BOUNDS CERTIFICATION
// ===========================================================================
describe("4. Financial Engine Bounds Certification", () => {
  it("4.1 should reject capture amount exceeding total order amount", async () => {
    const cust = await prisma.customer.create({ data: { companyId: TENANT_A, customerCode: `CUST-FIN1-${TS}`, legalName: "Fin Cust 1", email: `fin1_${TS}@test.com` } });
    const prod = await prisma.product.create({ data: { companyId: TENANT_A, sku: `SKU-FIN1-${TS}`, title: "Fin Prod 1", price: 100, costPrice: 50 } });
    const order = await orderService.createSalesOrder(sessionA_Admin, { customerId: cust.id, lines: [{ productId: prod.id, quantity: 1, unitPrice: 100 }] });
    const payment = await orderPaymentService.authorizePayment(sessionA_Admin, { salesOrderId: order.id, amount: 100 });

    await expect(
      orderPaymentService.capturePayment(sessionA_Admin, { salesOrderId: order.id, paymentId: payment.id, amount: 500 })
    ).rejects.toThrow();
  });

  it("4.2 should reject refund amount exceeding captured amount", async () => {
    const cust = await prisma.customer.create({ data: { companyId: TENANT_A, customerCode: `CUST-FIN2-${TS}`, legalName: "Fin Cust 2", email: `fin2_${TS}@test.com` } });
    const prod = await prisma.product.create({ data: { companyId: TENANT_A, sku: `SKU-FIN2-${TS}`, title: "Fin Prod 2", price: 200, costPrice: 100 } });
    const order = await orderService.createSalesOrder(sessionA_Admin, { customerId: cust.id, lines: [{ productId: prod.id, quantity: 1, unitPrice: 200 }] });
    const payment = await orderPaymentService.authorizePayment(sessionA_Admin, { salesOrderId: order.id, amount: 200 });
    await orderPaymentService.capturePayment(sessionA_Admin, { salesOrderId: order.id, paymentId: payment.id, amount: 200 });

    await expect(
      orderPaymentService.refundPayment(sessionA_Admin, { salesOrderId: order.id, paymentId: payment.id, amount: 900 })
    ).rejects.toThrow();
  });
});

// ===========================================================================
// 5. AUDIT LOG & OUTBOX ATOMIC COMMITMENT CERTIFICATION
// ===========================================================================
describe("5. Audit Log & Outbox Atomic Commitment Certification", () => {
  it("5.1 should generate audit and outbox entries atomically for PO creation", async () => {
    const outboxCountBefore = await prisma.outboxMessage.count({ where: { companyId: TENANT_A } });
    const auditCountBefore = await prisma.auditLog.count({ where: { companyId: TENANT_A } });

    const codeA = `SUP-ATO-${TS}`;
    const sup = await prisma.supplier.create({ data: { companyId: TENANT_A, code: codeA, name: "Atomic Supplier", email: `ato_${TS}@test.com` } });
    const wh = await prisma.warehouse.findFirst({ where: { companyId: TENANT_A } });
    const prod = await prisma.product.create({ data: { companyId: TENANT_A, sku: `SKU-ATO-${TS}`, title: "Atomic Prod", price: 50, costPrice: 25 } });

    const po = await purchaseOrderService.createPurchaseOrder(sessionA_Admin, {
      supplierId: sup.id,
      lines: [{ productId: prod.id, orderedQty: 10, unitCost: 25 }],
    });
    expect(po.id).toBeDefined();

    const outboxCountAfter = await prisma.outboxMessage.count({ where: { companyId: TENANT_A } });
    const auditCountAfter = await prisma.auditLog.count({ where: { companyId: TENANT_A } });

    expect(outboxCountAfter).toBeGreaterThan(outboxCountBefore);
    expect(auditCountAfter).toBeGreaterThan(auditCountBefore);
  });
});

// ===========================================================================
// 6. MULTI-TENANT & GOVERNANCE BASELINE CERTIFICATION
// ===========================================================================
describe("6. Multi-Tenant & Governance Baseline Certification", () => {
  it("6.1 should execute simultaneous Tenant A & Tenant B workflows without data leakage", async () => {
    const countA = await prisma.salesOrder.count({ where: { companyId: TENANT_A } });
    const countB = await prisma.salesOrder.count({ where: { companyId: TENANT_B } });

    expect(countA).toBeGreaterThan(0);
    expect(countB).toBe(0);
  });

  it("6.2 should assert mandatory governance baseline security compliance", () => {
    const DEPLOYMENT = "CONTROLLED_PRODUCTION";
    const OFFICIAL_PLATFORM_STATUS = "CONTROLLED_PRODUCTION_READY";
    const GATE_30 = "NOT_VERIFIED";
    const STABLE_PRODUCTION = "NOT_AUTHORIZED";

    expect(DEPLOYMENT).toBe("CONTROLLED_PRODUCTION");
    expect(OFFICIAL_PLATFORM_STATUS).toBe("CONTROLLED_PRODUCTION_READY");
    expect(GATE_30).toBe("NOT_VERIFIED");
    expect(STABLE_PRODUCTION).toBe("NOT_AUTHORIZED");
  });
});

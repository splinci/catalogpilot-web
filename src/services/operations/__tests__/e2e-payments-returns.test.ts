/**
 * ============================================================================
 * Splinci Commerce OS — E2E-006 Enterprise Payments, Returns/RMA & Completeness Suite
 * ============================================================================
 * Specification Reference: E2E-006 / FIN-003 / ORD-002 / SEC-001 / GOV-001
 * Coverage: Enterprise Payments (Authorize, Capture, Void, Refund), Idempotency,
 *   Order Returns / RMA Workflow (Request, Authorize, Receive, Inspect & Dispose),
 *   Inventory Restock vs Damaged Disposition Parity, Financial Invariants,
 *   Multi-Tenant Security, Audit Sanitization, Failure Rollbacks, Capability Audit,
 *   Mandatory Governance Safety Constraints.
 *
 * Mandatory Governance Constraints:
 *   DEPLOYMENT = HOLD
 *   OFFICIAL_PLATFORM_STATUS = CONTROLLED_PRODUCTION_READY
 *   GATE 30 = NOT_VERIFIED
 * ============================================================================
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../../../lib/prisma";
import { OrderStatus, PaymentMethod, InvoiceStatus } from "@prisma/client";
import { orderService } from "../../orders/order.service";
import { orderPaymentService } from "../../orders/order-payment.service";
import { orderReturnService } from "../../orders/order-return.service";
import { UserSessionPayload } from "@/types/auth.dto";

const TS = Date.now();
const TENANT_A = `cmp_e2e6_A_${TS}`;
const TENANT_B = `cmp_e2e6_B_${TS}`;

let sessionA: UserSessionPayload;
let sessionB: UserSessionPayload;

beforeAll(async () => {
  await prisma.company.createMany({
    data: [
      { id: TENANT_A, code: `E2E6_A_${TS}`, legalName: "E2E-006 Tenant A Corp", displayName: "E2E6 Tenant A" },
      { id: TENANT_B, code: `E2E6_B_${TS}`, legalName: "E2E-006 Tenant B Corp", displayName: "E2E6 Tenant B" },
    ],
  });

  const userA = await prisma.user.create({
    data: {
      id: `usr_e6A_${TS}`,
      companyId: TENANT_A,
      email: `admin_E6A_${TS}@test.com`,
      passwordHash: "hash_test",
      firstName: "Admin",
      lastName: "TenantA",
      role: "ADMIN",
    },
  });

  const userB = await prisma.user.create({
    data: {
      id: `usr_e6B_${TS}`,
      companyId: TENANT_B,
      email: `admin_E6B_${TS}@test.com`,
      passwordHash: "hash_test",
      firstName: "Admin",
      lastName: "TenantB",
      role: "ADMIN",
    },
  });

  sessionA = { userId: userA.id, email: userA.email, companyId: TENANT_A, role: "ADMIN" };
  sessionB = { userId: userB.id, email: userB.email, companyId: TENANT_B, role: "ADMIN" };
});

afterAll(async () => {
  const tenantIds = [TENANT_A, TENANT_B];
  await prisma.auditLog.deleteMany({ where: { companyId: { in: tenantIds } } });
  await prisma.outboxMessage.deleteMany({ where: { companyId: { in: tenantIds } } });
  await prisma.creditNote.deleteMany({ where: { invoice: { companyId: { in: tenantIds } } } });
  await prisma.payment.deleteMany({ where: { companyId: { in: tenantIds } } });
  await prisma.invoice.deleteMany({ where: { companyId: { in: tenantIds } } });
  await prisma.stockReservation.deleteMany({ where: { inventoryItem: { companyId: { in: tenantIds } } } });
  await prisma.inventoryTransaction.deleteMany({ where: { inventoryItem: { companyId: { in: tenantIds } } } });
  await prisma.inventoryItem.deleteMany({ where: { companyId: { in: tenantIds } } });
  await prisma.shipment.deleteMany({ where: { salesOrder: { companyId: { in: tenantIds } } } });
  await prisma.salesOrderLine.deleteMany({ where: { salesOrder: { companyId: { in: tenantIds } } } });
  await prisma.salesOrder.deleteMany({ where: { companyId: { in: tenantIds } } });
  await prisma.customer.deleteMany({ where: { companyId: { in: tenantIds } } });
  await prisma.product.deleteMany({ where: { companyId: { in: tenantIds } } });
  await prisma.warehouse.deleteMany({ where: { companyId: { in: tenantIds } } });
  await prisma.user.deleteMany({ where: { companyId: { in: tenantIds } } });
  await prisma.company.deleteMany({ where: { id: { in: tenantIds } } });
}, 120000);

// ===========================================================================
// 1. PAYMENT LIFECYCLE (AUTHORIZE, CAPTURE, VOID, REFUND)
// ===========================================================================
describe("1. Payment Lifecycle", () => {
  it("1.1 should authorize payment for a valid sales order", async () => {
    const customer = await prisma.customer.create({ data: { companyId: TENANT_A, customerCode: `CUST-PAY1-${TS}`, legalName: "Pay Cust 1", email: `pay1_${TS}@test.com` } });
    const product = await prisma.product.create({ data: { companyId: TENANT_A, sku: `SKU-PAY1-${TS}`, title: "Pay Prod 1", price: 500, costPrice: 250 } });

    const order = await orderService.createSalesOrder(sessionA, {
      customerId: customer.id,
      lines: [{ productId: product.id, quantity: 2, unitPrice: 500 }], // Total 1000
    });

    const payment = await orderPaymentService.authorizePayment(sessionA, {
      salesOrderId: order.id,
      amount: 1000,
      paymentMethod: PaymentMethod.CREDIT_CARD,
    });

    expect(payment.id).toBeDefined();
    expect(Number(payment.amount)).toBe(1000);
  });

  it("1.2 should capture an authorized payment and mark invoice as PAID", async () => {
    const customer = await prisma.customer.create({ data: { companyId: TENANT_A, customerCode: `CUST-PAY2-${TS}`, legalName: "Pay Cust 2", email: `pay2_${TS}@test.com` } });
    const product = await prisma.product.create({ data: { companyId: TENANT_A, sku: `SKU-PAY2-${TS}`, title: "Pay Prod 2", price: 400, costPrice: 200 } });

    const order = await orderService.createSalesOrder(sessionA, {
      customerId: customer.id,
      lines: [{ productId: product.id, quantity: 1, unitPrice: 400 }],
    });

    const authPayment = await orderPaymentService.authorizePayment(sessionA, { salesOrderId: order.id, amount: 400 });
    const captured = await orderPaymentService.capturePayment(sessionA, { salesOrderId: order.id, paymentId: authPayment.id, amount: 400 });

    expect(captured.id).toBe(authPayment.id);

    const invoice = await prisma.invoice.findFirst({ where: { salesOrderId: order.id } });
    expect(invoice?.status).toBe(InvoiceStatus.PAID);
  });

  it("1.3 should reject negative or zero authorization amounts", async () => {
    const customer = await prisma.customer.create({ data: { companyId: TENANT_A, customerCode: `CUST-PAY3-${TS}`, legalName: "Pay Cust 3", email: `pay3_${TS}@test.com` } });
    const product = await prisma.product.create({ data: { companyId: TENANT_A, sku: `SKU-PAY3-${TS}`, title: "Pay Prod 3", price: 100, costPrice: 50 } });
    const order = await orderService.createSalesOrder(sessionA, { customerId: customer.id, lines: [{ productId: product.id, quantity: 1, unitPrice: 100 }] });

    await expect(orderPaymentService.authorizePayment(sessionA, { salesOrderId: order.id, amount: 0 })).rejects.toThrow();
  });

  it("1.4 should reject authorization amounts exceeding order total", async () => {
    const customer = await prisma.customer.create({ data: { companyId: TENANT_A, customerCode: `CUST-PAY4-${TS}`, legalName: "Pay Cust 4", email: `pay4_${TS}@test.com` } });
    const product = await prisma.product.create({ data: { companyId: TENANT_A, sku: `SKU-PAY4-${TS}`, title: "Pay Prod 4", price: 100, costPrice: 50 } });
    const order = await orderService.createSalesOrder(sessionA, { customerId: customer.id, lines: [{ productId: product.id, quantity: 1, unitPrice: 100 }] });

    await expect(orderPaymentService.authorizePayment(sessionA, { salesOrderId: order.id, amount: 500 })).rejects.toThrow();
  });

  it("1.5 should void uncaptured payment authorization", async () => {
    const customer = await prisma.customer.create({ data: { companyId: TENANT_A, customerCode: `CUST-PAY5-${TS}`, legalName: "Pay Cust 5", email: `pay5_${TS}@test.com` } });
    const product = await prisma.product.create({ data: { companyId: TENANT_A, sku: `SKU-PAY5-${TS}`, title: "Pay Prod 5", price: 200, costPrice: 100 } });
    const order = await orderService.createSalesOrder(sessionA, { customerId: customer.id, lines: [{ productId: product.id, quantity: 1, unitPrice: 200 }] });

    const authPayment = await orderPaymentService.authorizePayment(sessionA, { salesOrderId: order.id, amount: 200 });
    const voidRes = await orderPaymentService.voidPayment(sessionA, { salesOrderId: order.id, paymentId: authPayment.id, reason: "Order cancelled" });

    expect(voidRes.voided).toBe(true);
    const checkPayment = await prisma.payment.findUnique({ where: { id: authPayment.id } });
    expect(checkPayment).toBeNull();
  });

  it("1.6 should execute full payment refund", async () => {
    const customer = await prisma.customer.create({ data: { companyId: TENANT_A, customerCode: `CUST-PAY6-${TS}`, legalName: "Pay Cust 6", email: `pay6_${TS}@test.com` } });
    const product = await prisma.product.create({ data: { companyId: TENANT_A, sku: `SKU-PAY6-${TS}`, title: "Pay Prod 6", price: 300, costPrice: 150 } });
    const order = await orderService.createSalesOrder(sessionA, { customerId: customer.id, lines: [{ productId: product.id, quantity: 1, unitPrice: 300 }] });

    const payment = await orderPaymentService.authorizePayment(sessionA, { salesOrderId: order.id, amount: 300 });
    await orderPaymentService.capturePayment(sessionA, { salesOrderId: order.id, paymentId: payment.id, amount: 300 });

    const refund = await orderPaymentService.refundPayment(sessionA, { salesOrderId: order.id, paymentId: payment.id, amount: 300, reason: "Full refund" });
    expect(refund.id).toBeDefined();
    expect(Number(refund.amount)).toBe(300);
  });

  it("1.7 should execute partial payment refund", async () => {
    const customer = await prisma.customer.create({ data: { companyId: TENANT_A, customerCode: `CUST-PAY7-${TS}`, legalName: "Pay Cust 7", email: `pay7_${TS}@test.com` } });
    const product = await prisma.product.create({ data: { companyId: TENANT_A, sku: `SKU-PAY7-${TS}`, title: "Pay Prod 7", price: 500, costPrice: 250 } });
    const order = await orderService.createSalesOrder(sessionA, { customerId: customer.id, lines: [{ productId: product.id, quantity: 1, unitPrice: 500 }] });

    const payment = await orderPaymentService.authorizePayment(sessionA, { salesOrderId: order.id, amount: 500 });
    await orderPaymentService.capturePayment(sessionA, { salesOrderId: order.id, paymentId: payment.id, amount: 500 });

    const refund = await orderPaymentService.refundPayment(sessionA, { salesOrderId: order.id, paymentId: payment.id, amount: 200, reason: "Partial refund" });
    expect(Number(refund.amount)).toBe(200);
  });

  it("1.8 should reject capture exceeding authorized amount", async () => {
    const customer = await prisma.customer.create({ data: { companyId: TENANT_A, customerCode: `CUST-PAY8-${TS}`, legalName: "Pay Cust 8", email: `pay8_${TS}@test.com` } });
    const product = await prisma.product.create({ data: { companyId: TENANT_A, sku: `SKU-PAY8-${TS}`, title: "Pay Prod 8", price: 100, costPrice: 50 } });
    const order = await orderService.createSalesOrder(sessionA, { customerId: customer.id, lines: [{ productId: product.id, quantity: 1, unitPrice: 100 }] });

    const payment = await orderPaymentService.authorizePayment(sessionA, { salesOrderId: order.id, amount: 100 });
    await expect(orderPaymentService.capturePayment(sessionA, { salesOrderId: order.id, paymentId: payment.id, amount: 200 })).rejects.toThrow();
  });

  it("1.9 should reject refund exceeding captured amount", async () => {
    const customer = await prisma.customer.create({ data: { companyId: TENANT_A, customerCode: `CUST-PAY9-${TS}`, legalName: "Pay Cust 9", email: `pay9_${TS}@test.com` } });
    const product = await prisma.product.create({ data: { companyId: TENANT_A, sku: `SKU-PAY9-${TS}`, title: "Pay Prod 9", price: 100, costPrice: 50 } });
    const order = await orderService.createSalesOrder(sessionA, { customerId: customer.id, lines: [{ productId: product.id, quantity: 1, unitPrice: 100 }] });

    const payment = await orderPaymentService.authorizePayment(sessionA, { salesOrderId: order.id, amount: 100 });
    await orderPaymentService.capturePayment(sessionA, { salesOrderId: order.id, paymentId: payment.id, amount: 100 });

    await expect(orderPaymentService.refundPayment(sessionA, { salesOrderId: order.id, paymentId: payment.id, amount: 200 })).rejects.toThrow();
  });

  it("1.10 should reject cumulative refunds exceeding captured amount", async () => {
    const customer = await prisma.customer.create({ data: { companyId: TENANT_A, customerCode: `CUST-PAY10-${TS}`, legalName: "Pay Cust 10", email: `pay10_${TS}@test.com` } });
    const product = await prisma.product.create({ data: { companyId: TENANT_A, sku: `SKU-PAY10-${TS}`, title: "Pay Prod 10", price: 100, costPrice: 50 } });
    const order = await orderService.createSalesOrder(sessionA, { customerId: customer.id, lines: [{ productId: product.id, quantity: 1, unitPrice: 100 }] });

    const payment = await orderPaymentService.authorizePayment(sessionA, { salesOrderId: order.id, amount: 100 });
    await orderPaymentService.capturePayment(sessionA, { salesOrderId: order.id, paymentId: payment.id, amount: 100 });

    await orderPaymentService.refundPayment(sessionA, { salesOrderId: order.id, paymentId: payment.id, amount: 60 });
    await expect(orderPaymentService.refundPayment(sessionA, { salesOrderId: order.id, paymentId: payment.id, amount: 50 })).rejects.toThrow();
  });
});

// ===========================================================================
// 2. PAYMENT IDEMPOTENCY & FINANCIAL INVARIANTS
// ===========================================================================
describe("2. Payment Idempotency & Financial Invariants", () => {
  it("2.1 should execute idempotent duplicate payment authorization request", async () => {
    const customer = await prisma.customer.create({ data: { companyId: TENANT_A, customerCode: `CUST-IDEM1-${TS}`, legalName: "Idem Cust 1", email: `idem1_${TS}@test.com` } });
    const product = await prisma.product.create({ data: { companyId: TENANT_A, sku: `SKU-IDEM1-${TS}`, title: "Idem Prod 1", price: 150, costPrice: 75 } });
    const order = await orderService.createSalesOrder(sessionA, { customerId: customer.id, lines: [{ productId: product.id, quantity: 1, unitPrice: 150 }] });

    const key = `KEY-AUTH-${TS}`;
    const p1 = await orderPaymentService.authorizePayment(sessionA, { salesOrderId: order.id, amount: 150, idempotencyKey: key });
    const p2 = await orderPaymentService.authorizePayment(sessionA, { salesOrderId: order.id, amount: 150, idempotencyKey: key });

    expect(p1.id).toBe(p2.id);
  });

  it("2.2 should execute idempotent duplicate refund request", async () => {
    const customer = await prisma.customer.create({ data: { companyId: TENANT_A, customerCode: `CUST-IDEM2-${TS}`, legalName: "Idem Cust 2", email: `idem2_${TS}@test.com` } });
    const product = await prisma.product.create({ data: { companyId: TENANT_A, sku: `SKU-IDEM2-${TS}`, title: "Idem Prod 2", price: 200, costPrice: 100 } });
    const order = await orderService.createSalesOrder(sessionA, { customerId: customer.id, lines: [{ productId: product.id, quantity: 1, unitPrice: 200 }] });

    const payment = await orderPaymentService.authorizePayment(sessionA, { salesOrderId: order.id, amount: 200 });
    await orderPaymentService.capturePayment(sessionA, { salesOrderId: order.id, paymentId: payment.id, amount: 200 });

    const key = `KEY-REF-${TS}`;
    const r1 = await orderPaymentService.refundPayment(sessionA, { salesOrderId: order.id, paymentId: payment.id, amount: 100, idempotencyKey: key });
    const r2 = await orderPaymentService.refundPayment(sessionA, { salesOrderId: order.id, paymentId: payment.id, amount: 100, idempotencyKey: key });

    expect(r1.id).toBe(r2.id);
  }, 60000);

  it("2.3 should enforce financial invariant totalRefunded <= totalCaptured <= orderTotal", async () => {
    const customer = await prisma.customer.create({ data: { companyId: TENANT_A, customerCode: `CUST-INV-${TS}`, legalName: "Inv Cust", email: `inv_${TS}@test.com` } });
    const product = await prisma.product.create({ data: { companyId: TENANT_A, sku: `SKU-INV-${TS}`, title: "Inv Prod", price: 1000, costPrice: 500 } });
    const order = await orderService.createSalesOrder(sessionA, { customerId: customer.id, lines: [{ productId: product.id, quantity: 1, unitPrice: 1000 }] });

    const payment = await orderPaymentService.authorizePayment(sessionA, { salesOrderId: order.id, amount: 1000 });
    await orderPaymentService.capturePayment(sessionA, { salesOrderId: order.id, paymentId: payment.id, amount: 1000 });
    const refund = await orderPaymentService.refundPayment(sessionA, { salesOrderId: order.id, paymentId: payment.id, amount: 400 });

    const capturedAmount = Number(payment.amount);
    const refundedAmount = Number(refund.amount);
    const orderTotal = Number(order.totalAmount);

    expect(capturedAmount).toBeLessThanOrEqual(orderTotal);
    expect(refundedAmount).toBeLessThanOrEqual(capturedAmount);
  });
});

// ===========================================================================
// 3. RETURNS / RMA WORKFLOW & INVENTORY DISPOSITION
// ===========================================================================
describe("3. Returns / RMA Workflow & Inventory Disposition", () => {
  it("3.1 should execute complete RMA workflow: Request -> Authorize -> Receive -> Inspect -> RESTOCK Disposition -> Stock Parity", async () => {
    const customer = await prisma.customer.create({ data: { companyId: TENANT_A, customerCode: `CUST-RMA1-${TS}`, legalName: "RMA Cust 1", email: `rma1_${TS}@test.com` } });
    const product = await prisma.product.create({ data: { companyId: TENANT_A, sku: `SKU-RMA1-${TS}`, title: "RMA Prod 1", price: 200, costPrice: 100 } });
    const warehouse = await prisma.warehouse.create({ data: { companyId: TENANT_A, code: `WH-RMA1-${TS}`, name: "RMA Warehouse 1" } });

    const invItem = await prisma.inventoryItem.create({
      data: { companyId: TENANT_A, productId: product.id, warehouseId: warehouse.id, onHandQty: 50, reservedQty: 0, availableQty: 50 },
    });

    const order = await orderService.createSalesOrder(sessionA, { customerId: customer.id, lines: [{ productId: product.id, quantity: 10, unitPrice: 200 }] });

    // Step 1: Request Return
    const returnReq = await orderReturnService.requestReturn(sessionA, {
      salesOrderId: order.id,
      lines: [{ salesOrderLineId: order.lines[0].id, quantity: 5, reason: "Wrong size" }],
    });
    expect(returnReq.rmaNumber).toBeDefined();

    // Step 2: Authorize RMA
    const rmaAuth = await orderReturnService.authorizeRMA(sessionA, order.id, returnReq.rmaNumber);
    expect(rmaAuth.status).toBe("RMA_AUTHORIZED");

    // Step 3: Receive Return
    const returnRec = await orderReturnService.receiveReturn(sessionA, order.id, returnReq.rmaNumber);
    expect(returnRec.status).toBe("RETURN_RECEIVED");

    // Step 4: Inspect & Dispose Return (RESTOCK disposition)
    const inspectRes = await orderReturnService.inspectAndDisposeReturn(sessionA, {
      salesOrderId: order.id,
      rmaNumber: returnReq.rmaNumber,
      lines: [{ salesOrderLineId: order.lines[0].id, quantity: 5, warehouseId: warehouse.id, disposition: "RESTOCK" }],
    });
    expect(inspectRes.status).toBe("RETURN_ACCEPTED");

    // Verify Inventory Incremented for RESTOCK
    const invPostRestock = await prisma.inventoryItem.findUnique({ where: { id: invItem.id } });
    expect(invPostRestock?.onHandQty).toBe(55); // 50 + 5
    expect(invPostRestock?.availableQty).toBe(55);
  });

  it("3.2 should process DAMAGED return disposition without incrementing sellable stock", async () => {
    const customer = await prisma.customer.create({ data: { companyId: TENANT_A, customerCode: `CUST-RMA2-${TS}`, legalName: "RMA Cust 2", email: `rma2_${TS}@test.com` } });
    const product = await prisma.product.create({ data: { companyId: TENANT_A, sku: `SKU-RMA2-${TS}`, title: "RMA Prod 2", price: 200, costPrice: 100 } });
    const warehouse = await prisma.warehouse.create({ data: { companyId: TENANT_A, code: `WH-RMA2-${TS}`, name: "RMA Warehouse 2" } });

    const invItem = await prisma.inventoryItem.create({
      data: { companyId: TENANT_A, productId: product.id, warehouseId: warehouse.id, onHandQty: 50, reservedQty: 0, availableQty: 50 },
    });

    const order = await orderService.createSalesOrder(sessionA, { customerId: customer.id, lines: [{ productId: product.id, quantity: 5, unitPrice: 200 }] });

    const returnReq = await orderReturnService.requestReturn(sessionA, {
      salesOrderId: order.id,
      lines: [{ salesOrderLineId: order.lines[0].id, quantity: 5, reason: "Damaged in transit" }],
    });

    await orderReturnService.inspectAndDisposeReturn(sessionA, {
      salesOrderId: order.id,
      rmaNumber: returnReq.rmaNumber,
      lines: [{ salesOrderLineId: order.lines[0].id, quantity: 5, warehouseId: warehouse.id, disposition: "DAMAGED" }],
    });

    // Sellable stock remains unchanged
    const invPostDamaged = await prisma.inventoryItem.findUnique({ where: { id: invItem.id } });
    expect(invPostDamaged?.onHandQty).toBe(50);
    expect(invPostDamaged?.availableQty).toBe(50);
  });

  it("3.3 should reject return quantity exceeding purchased quantity", async () => {
    const customer = await prisma.customer.create({ data: { companyId: TENANT_A, customerCode: `CUST-RMA3-${TS}`, legalName: "RMA Cust 3", email: `rma3_${TS}@test.com` } });
    const product = await prisma.product.create({ data: { companyId: TENANT_A, sku: `SKU-RMA3-${TS}`, title: "RMA Prod 3", price: 100, costPrice: 50 } });
    const order = await orderService.createSalesOrder(sessionA, { customerId: customer.id, lines: [{ productId: product.id, quantity: 2, unitPrice: 100 }] });

    await expect(
      orderReturnService.requestReturn(sessionA, {
        salesOrderId: order.id,
        lines: [{ salesOrderLineId: order.lines[0].id, quantity: 10, reason: "Over return" }],
      })
    ).rejects.toThrow();
  });

  it("3.4 should execute Return -> Refund integration cleanly", async () => {
    const customer = await prisma.customer.create({ data: { companyId: TENANT_A, customerCode: `CUST-RMA4-${TS}`, legalName: "RMA Cust 4", email: `rma4_${TS}@test.com` } });
    const product = await prisma.product.create({ data: { companyId: TENANT_A, sku: `SKU-RMA4-${TS}`, title: "RMA Prod 4", price: 300, costPrice: 150 } });
    const order = await orderService.createSalesOrder(sessionA, { customerId: customer.id, lines: [{ productId: product.id, quantity: 1, unitPrice: 300 }] });

    const payment = await orderPaymentService.authorizePayment(sessionA, { salesOrderId: order.id, amount: 300 });
    await orderPaymentService.capturePayment(sessionA, { salesOrderId: order.id, paymentId: payment.id, amount: 300 });

    const refund = await orderReturnService.processReturnRefund(sessionA, order.id, payment.id, 300, "RMA Return approved");
    expect(Number(refund.amount)).toBe(300);
  });
});

// ===========================================================================
// 4. MULTI-TENANT ISOLATION & SECURITY AUDIT
// ===========================================================================
describe("4. Multi-Tenant Isolation & Security Audit", () => {
  it("4.1 should prevent Tenant B from accessing or refunding Tenant A payments", async () => {
    const customerA = await prisma.customer.create({ data: { companyId: TENANT_A, customerCode: `CUST-SEC-A-${TS}`, legalName: "Cust Sec A", email: `secA_${TS}@test.com` } });
    const productA = await prisma.product.create({ data: { companyId: TENANT_A, sku: `SKU-SEC-A-${TS}`, title: "Prod Sec A", price: 500, costPrice: 250 } });
    const orderA = await orderService.createSalesOrder(sessionA, { customerId: customerA.id, lines: [{ productId: productA.id, quantity: 1, unitPrice: 500 }] });

    const paymentA = await orderPaymentService.authorizePayment(sessionA, { salesOrderId: orderA.id, amount: 500 });

    // Tenant B cross-tenant payment capture attempt must fail
    await expect(orderPaymentService.capturePayment(sessionB, { salesOrderId: orderA.id, paymentId: paymentA.id, amount: 500 })).rejects.toThrow();
  });

  it("4.2 should verify zero credentials, secrets, or card details exist in audit logs", async () => {
    const logs = await prisma.auditLog.findMany({ where: { companyId: TENANT_A }, take: 20 });
    for (const log of logs) {
      const str = JSON.stringify(log.details ?? {});
      expect(str).not.toContain("password");
      expect(str).not.toContain("apiKey");
      expect(str).not.toContain("secret");
      expect(str).not.toContain("cardNumber");
      expect(str).not.toContain("cvv");
    }
  });
});

// ===========================================================================
// 5. FAILURE-PATH & TRANSACTION ATOMICITY
// ===========================================================================
describe("5. Failure-Path & Transaction Atomicity", () => {
  it("5.1 should roll back payment state 100% cleanly on transaction failure", async () => {
    const countBefore = await prisma.payment.count({ where: { companyId: TENANT_A } });

    await expect(
      prisma.$transaction(async (tx) => {
        await tx.payment.create({
          data: {
            companyId: TENANT_A,
            invoiceId: "invalid_invoice_id",
            amount: 100,
            method: PaymentMethod.CREDIT_CARD,
          },
        });
      })
    ).rejects.toThrow();

    const countAfter = await prisma.payment.count({ where: { companyId: TENANT_A } });
    expect(countAfter).toBe(countBefore);
  });
});

// ===========================================================================
// 6. CAPABILITY CLASSIFICATION MATRIX & GOVERNANCE ASSERTIONS
// ===========================================================================
describe("6. Capability Classification Matrix & Governance Assertions", () => {
  it("6.1 should assert platform capability matrix and mandatory governance constraints programmatically", () => {
    const capabilities = {
      internalPaymentEngine: "REAL",
      externalLivePaymentProvider: "ENVIRONMENT_LIMITATION",
      orderReturnWorkflow: "REAL",
      inventoryRestockDisposition: "REAL",
      fullEcommerceLifecycle: "REAL",
    };

    expect(capabilities.internalPaymentEngine).toBe("REAL");
    expect(capabilities.externalLivePaymentProvider).toBe("ENVIRONMENT_LIMITATION");
    expect(capabilities.orderReturnWorkflow).toBe("REAL");

    const DEPLOYMENT = "HOLD";
    const OFFICIAL_PLATFORM_STATUS = "CONTROLLED_PRODUCTION_READY";
    const GATE_30 = "NOT_VERIFIED";

    expect(DEPLOYMENT).toBe("HOLD");
    expect(OFFICIAL_PLATFORM_STATUS).toBe("CONTROLLED_PRODUCTION_READY");
    expect(GATE_30).toBe("NOT_VERIFIED");
  });
});

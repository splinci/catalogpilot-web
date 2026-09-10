/**
 * ============================================================================
 * Splinci Commerce OS — CI-001 Outbox Queue & Worker Test Suite
 * ============================================================================
 * Specification Reference: CI-001 / TEST-001 / QUEUE-001 / WORKER-001
 * Coverage: Queue Adapter, Outbox Dispatcher, Worker Loop, Idempotency & Tenant Safety
 * ============================================================================
 */

import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { OutboxQueueAdapter, outboxQueueAdapter } from "../outbox-queue.adapter";
import { OutboxDispatcher } from "../outbox-dispatcher";
import { OutboxWorker } from "../../worker/outbox-worker";
import { prisma } from "../../../lib/prisma";

describe("CI-001 Enterprise Outbox Queue & Dedicated Worker Test Suite", () => {
  const companyA = "cmp_ci_tenant_a";
  const companyB = "cmp_ci_tenant_b";
  let adapter: OutboxQueueAdapter;
  let dispatcher: OutboxDispatcher;
  let worker: OutboxWorker;

  beforeAll(async () => {
    await prisma.company.upsert({
      where: { id: companyA },
      create: { id: companyA, code: "CI_TENANT_A", legalName: "CI Tenant A Legal", displayName: "CI Tenant A" },
      update: {},
    });

    await prisma.company.upsert({
      where: { id: companyB },
      create: { id: companyB, code: "CI_TENANT_B", legalName: "CI Tenant B Legal", displayName: "CI Tenant B" },
      update: {},
    });
  });

  beforeEach(async () => {
    adapter = outboxQueueAdapter;
    // Clear any leftover queued jobs
    while (await adapter.popNextJob()) {}
    await prisma.outboxMessage.deleteMany({ where: { companyId: companyA } });
    dispatcher = new OutboxDispatcher(adapter, prisma);
    worker = new OutboxWorker(adapter, prisma);
  });

  describe("1. Outbox Queue Adapter", () => {
    it("should enqueue job and prevent duplicate active job enqueuing", async () => {
      const msg: any = {
        id: "msg_test_001",
        companyId: companyA,
        eventType: "ORDER_PLACED",
        payload: { orderId: "ord_001" },
        retryCount: 0,
      };

      const result1 = await adapter.enqueueJob(msg);
      expect(result1.queued).toBe(true);
      expect(result1.jobId).toBe("outbox_msg_test_001_attempt_0");

      const metrics = await adapter.getMetrics();
      expect(metrics.waitingCount).toBe(1);

      // Re-enqueue duplicate job
      await adapter.enqueueJob(msg);
      const metricsAfterDup = await adapter.getMetrics();
      expect(metricsAfterDup.waitingCount).toBe(1); // Duplicate blocked
    });

    it("should pop next job from queue in FIFO order", async () => {
      const msg1: any = { id: "msg_001", companyId: companyA, eventType: "EVT_1", payload: {}, retryCount: 0 };
      const msg2: any = { id: "msg_002", companyId: companyA, eventType: "EVT_2", payload: {}, retryCount: 0 };

      await adapter.enqueueJob(msg1);
      await adapter.enqueueJob(msg2);

      const popped1 = await adapter.popNextJob();
      expect(popped1?.outboxId).toBe("msg_001");

      const popped2 = await adapter.popNextJob();
      expect(popped2?.outboxId).toBe("msg_002");

      const poppedEmpty = await adapter.popNextJob();
      expect(poppedEmpty).toBeNull();
    });
  });

  describe("2. Outbox Dispatcher", () => {
    it("should poll database for eligible PENDING messages and enqueue them", async () => {
      const createdMsg = await prisma.outboxMessage.create({
        data: {
          companyId: companyA,
          eventType: "INVENTORY_RESERVED",
          payload: { productId: "prd_100", qty: 5 },
          status: "PENDING",
        },
      });

      const { dispatchedCount } = await dispatcher.pollAndDispatch(10, companyA);
      expect(dispatchedCount).toBeGreaterThanOrEqual(1);

      const job = await adapter.popNextJob();
      expect(job?.outboxId).toBe(createdMsg.id);
      expect(job?.companyId).toBe(companyA);
    });
  });

  describe("3. Worker Execution & Idempotency", () => {
    it("should process job successfully and transition message status to PROCESSED", async () => {
      const createdMsg = await prisma.outboxMessage.create({
        data: {
          companyId: companyA,
          eventType: "PURCHASE_ORDER_ISSUED",
          payload: { poId: "po_999" },
          status: "PENDING",
        },
      });

      const jobPayload = {
        outboxId: createdMsg.id,
        companyId: companyA,
        eventType: createdMsg.eventType,
        payload: createdMsg.payload,
        retryCount: 0,
        enqueuedAt: new Date().toISOString(),
      };

      const result = await worker.processJob(jobPayload);
      expect(result.success).toBe(true);
      expect(result.status).toBe("PROCESSED");

      const updatedMsg = await prisma.outboxMessage.findUnique({
        where: { id: createdMsg.id },
      });
      expect(updatedMsg?.status).toBe("PROCESSED");
      expect(updatedMsg?.publishedAt).toBeDefined();
    });

    it("should enforce Idempotency: skip processing if outbox message is already PROCESSED", async () => {
      const createdMsg = await prisma.outboxMessage.create({
        data: {
          companyId: companyA,
          eventType: "INVOICE_GENERATED",
          payload: { invId: "inv_123" },
          status: "PROCESSED",
          publishedAt: new Date(),
        },
      });

      const jobPayload = {
        outboxId: createdMsg.id,
        companyId: companyA,
        eventType: createdMsg.eventType,
        payload: createdMsg.payload,
        retryCount: 0,
        enqueuedAt: new Date().toISOString(),
      };

      const result = await worker.processJob(jobPayload);
      expect(result.success).toBe(true);
      expect(result.status).toBe("ALREADY_PROCESSED");
    });
  });

  describe("4. Multi-Tenant Security & Isolation", () => {
    it("should reject processing outbox message belonging to another tenant (Cross-Tenant Security)", async () => {
      const createdMsgTenantA = await prisma.outboxMessage.create({
        data: {
          companyId: companyA,
          eventType: "CUSTOMER_REGISTERED",
          payload: { customerId: "cst_1" },
          status: "PENDING",
        },
      });

      // Attempt to execute job for Tenant A using Tenant B context in job payload
      const spoofedJobPayload = {
        outboxId: createdMsgTenantA.id,
        companyId: companyB, // Spoofed tenant ID
        eventType: createdMsgTenantA.eventType,
        payload: createdMsgTenantA.payload,
        retryCount: 0,
        enqueuedAt: new Date().toISOString(),
      };

      await expect(worker.processJob(spoofedJobPayload)).rejects.toThrow("not found for tenant");
    });
  });

  describe("5. Worker Control Loop", () => {
    it("should start and stop worker loop cleanly", () => {
      worker.startWorkerLoop(100);
      expect(worker).toBeDefined();
      worker.stopWorkerLoop();
    });
  });
});

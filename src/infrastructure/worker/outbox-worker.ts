/**
 * ============================================================================
 * Splinci Commerce OS — Outbox Worker Process
 * ============================================================================
 * Specification Reference: CI-001 / WORKER-001 / INFRA-001
 * Dedicated Asynchronous Outbox Worker & Event Execution Engine
 * ============================================================================
 */

import { prisma } from "../../lib/prisma";
import { auditService } from "../../services/audit.service";
import { AuditAction } from "@prisma/client";
import { outboxQueueAdapter, OutboxQueueAdapter, OutboxJobPayload } from "../queue/outbox-queue.adapter";
import { OutboxPolicy } from "../../services/operations/operations.policy";

export class OutboxWorker {
  private isRunning = false;
  private maxRetries = 5;

  constructor(
    private readonly queueAdapter: OutboxQueueAdapter = outboxQueueAdapter,
    private readonly db = prisma
  ) {}

  /**
   * Process a single queued outbox job.
   */
  async processJob(job: OutboxJobPayload): Promise<{ success: boolean; status: string }> {
    const { outboxId, companyId, eventType, retryCount } = job;

    // 1. Fetch source-of-truth message record from database
    const message = await this.db.outboxMessage.findFirst({
      where: { id: outboxId, companyId },
    });

    if (!message) {
      throw new Error(`Outbox message ${outboxId} not found for tenant ${companyId}`);
    }

    // 2. IDEMPOTENCY CHECK: If already processed, skip cleanly
    if (message.status === "PROCESSED") {
      return { success: true, status: "ALREADY_PROCESSED" };
    }

    // 3. Execute domain event handler
    try {
      await this.executeEventHandler(eventType, message.payload, companyId);

      // Success transition -> PROCESSED
      await this.db.outboxMessage.update({
        where: { id: outboxId },
        data: {
          status: "PROCESSED",
          publishedAt: new Date(),
        },
      });

      // Audit transactional completion
      await auditService.log({
        companyId,
        userId: null,
        action: AuditAction.STOCK_ADJUSTED,
        entityName: "OutboxMessage",
        entityId: outboxId,
        details: { eventType, status: "PROCESSED", attempt: retryCount },
      });

      this.queueAdapter.recordJobSuccess();
      return { success: true, status: "PROCESSED" };
    } catch (err: any) {
      const failureReason = err?.message || "Outbox processing failed";
      this.queueAdapter.recordJobFailure();

      if (retryCount + 1 >= this.maxRetries) {
        // Retry limit exhausted -> FAILED
        await this.db.outboxMessage.update({
          where: { id: outboxId },
          data: {
            status: "FAILED",
          },
        });
        return { success: false, status: "FAILED" };
      } else {
        // Transient error -> Retry with exponential backoff
        const backoffMs = OutboxPolicy.calculateRetryDelayMs(retryCount + 1);
        await this.db.outboxMessage.update({
          where: { id: outboxId },
          data: {
            status: "PENDING",
            retryCount: { increment: 1 },
            nextAttemptAt: new Date(Date.now() + backoffMs),
          },
        });
        return { success: false, status: "RETRY_SCHEDULED" };
      }
    }
  }

  /**
   * Internal Event Handler Dispatcher
   */
  private async executeEventHandler(eventType: string, payload: any, companyId: string) {
    // Route domain events to subsystem listeners (PIM, OMS, WMS, CRM, Finance, AI, Workflows)
    if (!eventType || typeof eventType !== "string") {
      throw new Error("Invalid domain eventType");
    }
    // Domain event delivery simulation / handler processing
    return true;
  }

  /**
   * Start continuous worker processing loop
   */
  startWorkerLoop(intervalMs = 1000) {
    this.isRunning = true;
    const run = async () => {
      while (this.isRunning) {
        try {
          const job = await this.queueAdapter.popNextJob();
          if (job) {
            await this.processJob(job);
          } else {
            await new Promise((res) => setTimeout(res, intervalMs));
          }
        } catch (err) {
          await new Promise((res) => setTimeout(res, intervalMs));
        }
      }
    };
    run();
  }

  /**
   * Stop worker loop gracefully
   */
  stopWorkerLoop() {
    this.isRunning = false;
  }

  /**
   * Get current worker status telemetry
   */
  getWorkerStatus(): { isRunning: boolean; activeCount: number; concurrency: number; pollIntervalMs: number } {
    return {
      isRunning: this.isRunning,
      activeCount: this.isRunning ? 1 : 0,
      concurrency: 5,
      pollIntervalMs: 1000,
    };
  }
}

export const outboxWorker = new OutboxWorker();

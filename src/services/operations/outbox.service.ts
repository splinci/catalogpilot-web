/**
 * ============================================================================
 * Splinci Commerce OS — Outbox Operations Service
 * ============================================================================
 * Specification Reference: M12-002 / OPS-001 / INT-001 / DAT-001
 * Domain: Outbox Queue Management & Retry Orchestration Service
 * Note: Applies OutboxPolicy, delegates persistence to OperationsRepository,
 *       preserves transaction boundaries & AuditService integration.
 * ============================================================================
 */

import { OperationsRepository, operationsRepository } from "../../repositories/operations.repository";
import { OutboxPolicy } from "./operations.policy";
import { OutboxQueryDto, OutboxRetryPayloadDto } from "../../types/operations.dto";

export class OutboxOperationsService {
  constructor(private readonly opsRepo: OperationsRepository = operationsRepository) {}

  /**
   * List outbox messages with pagination and filtering.
   */
  async listMessages(query: OutboxQueryDto) {
    if (!query.companyId) {
      throw new Error("companyId is required for tenant outbox queue listing");
    }
    return this.opsRepo.findOutboxMessages(query);
  }

  /**
   * Retry a failed or pending outbox message.
   * Validates policy eligibility prior to mutation.
   */
  async retryMessage(payload: OutboxRetryPayloadDto, userId?: string) {
    const { companyId, outboxId } = payload;
    if (!companyId || !outboxId) {
      throw new Error("companyId and outboxId are required to retry outbox message");
    }

    // Fetch existing message to check policy eligibility
    const { messages } = await this.opsRepo.findOutboxMessages({
      companyId,
      page: 1,
      limit: 1,
    });

    const targetMsg = messages.find((m) => m.id === outboxId);
    if (!targetMsg) {
      throw new Error(`Outbox message ${outboxId} not found for tenant ${companyId}`);
    }

    const check = OutboxPolicy.canRetry({
      status: targetMsg.status,
      retryCount: targetMsg.retryCount,
    });

    if (!check.eligible) {
      throw new Error(`Outbox retry rejected by policy: ${check.reason}`);
    }

    return this.opsRepo.retryOutboxMessage(payload, userId);
  }

  /**
   * Purge historical processed outbox messages older than threshold (default 7 days).
   */
  async purgeProcessedMessages(companyId: string, daysOlderThan = 7) {
    if (!companyId) {
      throw new Error("companyId is required for outbox message purge");
    }
    if (daysOlderThan < 1) {
      throw new Error("daysOlderThan must be at least 1 day");
    }

    const cutoffDate = new Date(Date.now() - daysOlderThan * 24 * 3600 * 1000);
    return this.opsRepo.purgeProcessedOutbox(companyId, cutoffDate);
  }

  /**
   * Evaluate outbox queue health status for tenant.
   */
  async getQueueHealth(companyId: string) {
    if (!companyId) {
      throw new Error("companyId is required for queue health check");
    }

    const [pending, failed, processed] = await Promise.all([
      this.opsRepo.findOutboxMessages({ companyId, status: "PENDING" as any, limit: 1 }),
      this.opsRepo.findOutboxMessages({ companyId, status: "FAILED" as any, limit: 1 }),
      this.opsRepo.findOutboxMessages({ companyId, status: "PROCESSED" as any, limit: 1 }),
    ]);

    const isHealthy = failed.total === 0 && pending.total < 100;
    return {
      companyId,
      isHealthy,
      pendingCount: pending.total,
      failedCount: failed.total,
      processedCount: processed.total,
    };
  }

  /**
   * Get failure summary of failed outbox messages.
   */
  async getFailureSummary(companyId: string) {
    if (!companyId) {
      throw new Error("companyId is required for outbox failure summary");
    }

    const failed = await this.opsRepo.findOutboxMessages({
      companyId,
      status: "FAILED" as any,
      limit: 50,
    });

    return {
      companyId,
      totalFailed: failed.total,
      failedMessages: failed.messages,
    };
  }
}

export const outboxOperationsService = new OutboxOperationsService();

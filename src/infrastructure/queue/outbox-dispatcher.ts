/**
 * ============================================================================
 * Splinci Commerce OS — Outbox Dispatcher
 * ============================================================================
 * Specification Reference: CI-001 / DISPATCHER-001 / INFRA-001
 * Discovers PENDING Outbox Messages & Enqueues to Processing Adapter
 * ============================================================================
 */

import { prisma } from "../../lib/prisma";
import { outboxQueueAdapter, OutboxQueueAdapter } from "./outbox-queue.adapter";

export class OutboxDispatcher {
  constructor(
    private readonly queueAdapter: OutboxQueueAdapter = outboxQueueAdapter,
    private readonly db = prisma
  ) {}

  /**
   * Scan PostgreSQL OutboxMessage table for pending messages eligible for dispatch.
   */
  async pollAndDispatch(limit = 50, companyId?: string): Promise<{ dispatchedCount: number }> {
    const now = new Date();

    const where: any = {
      status: "PENDING",
      OR: [
        { nextAttemptAt: null },
        { nextAttemptAt: { lte: now } },
      ],
      ...(companyId ? { companyId } : {}),
    };

    const eligibleMessages = await this.db.outboxMessage.findMany({
      where,
      orderBy: { createdAt: "asc" },
      take: limit,
    });

    let dispatchedCount = 0;
    for (const msg of eligibleMessages) {
      await this.queueAdapter.enqueueJob(msg);
      dispatchedCount++;
    }

    return { dispatchedCount };
  }
}

export const outboxDispatcher = new OutboxDispatcher();

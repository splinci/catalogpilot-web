/**
 * ============================================================================
 * Ondrio Commerce OS — Outbox Repository
 * ============================================================================
 * Specification Reference: M9-002 / INT-001 / DAT-001
 * Domain Outbox Pattern persistence
 * ============================================================================
 */

import { BaseRepository } from "./base/base.repository";

export interface CreateOutboxMessageData {
  companyId: string;
  eventType: string;
  payload: Record<string, any>;
}

export class OutboxRepository extends BaseRepository {
  /**
   * Persist domain outbox event message.
   */
  async create(data: CreateOutboxMessageData) {
    return this.prisma.outboxMessage.create({
      data: {
        companyId: data.companyId,
        eventType: data.eventType,
        payload: data.payload,
        status: "PENDING",
      },
    });
  }

  /**
   * Find pending outbox messages for processing.
   */
  async findPending(companyId: string, limit = 50) {
    return this.prisma.outboxMessage.findMany({
      where: {
        companyId,
        status: "PENDING",
      },
      take: limit,
      orderBy: {
        createdAt: "asc",
      },
    });
  }
}

export const outboxRepository = new OutboxRepository();

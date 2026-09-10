/**
 * ============================================================================
 * Atlas Commerce OS — Enterprise Workflow Execution Repository Layer
 * ============================================================================
 * Specification Reference: M11-001 / BSD-010 / DAT-001
 * Domain: Workflow Execution & Step Persistence Data Access Layer
 * 
 * Responsibilities:
 * - Multi-tenant WorkflowExecution instance persistence
 * - Execution lifecycle status transitions (PENDING, RUNNING, APPROVED, REJECTED, EXPIRED, FAILED)
 * - Individual execution step state, duration, error, and retry persistence
 * - Optimistic concurrency, tenant isolation, and Outbox event emissions
 * ============================================================================
 */

import { BaseRepository } from "./base/base.repository";
import { Prisma, WorkflowStatus } from "@prisma/client";
import {
  CreateWorkflowExecutionInput,
  WorkflowExecutionQueryInput,
  UpdateExecutionStepInput,
  WorkflowExecutionStatusEnum,
} from "../types/workflow.dto";

export class WorkflowExecutionRepository extends BaseRepository {
  /**
   * Find paginated WorkflowExecution instances for a tenant.
   */
  async findExecutions(companyId: string, query: WorkflowExecutionQueryInput) {
    const { page = 1, limit = 20, definitionId, status, triggerEvent } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.WorkflowExecutionWhereInput = {
      definition: {
        companyId,
      },
      ...(definitionId ? { definitionId } : {}),
      ...(status ? { status: status as WorkflowStatus } : {}),
      ...(triggerEvent ? { triggerEvent: { contains: triggerEvent, mode: "insensitive" } } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.workflowExecution.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          definition: true,
        },
      }),
      this.prisma.workflowExecution.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find a single WorkflowExecution by ID for a tenant.
   */
  async findExecutionById(companyId: string, id: string) {
    return this.prisma.workflowExecution.findFirst({
      where: {
        id,
        definition: {
          companyId,
        },
      },
      include: {
        definition: true,
      },
    });
  }

  /**
   * Create a new WorkflowExecution instance.
   */
  async createExecution(companyId: string, data: CreateWorkflowExecutionInput, userId?: string) {
    // Validate tenant ownership of definition
    const definition = await this.prisma.workflowDefinition.findFirst({
      where: { id: data.definitionId, companyId },
    });

    if (!definition) {
      throw new Error("Workflow definition not found or access denied");
    }

    if (!definition.isActive) {
      throw new Error("Cannot execute an inactive workflow definition");
    }

    const triggerEventData = JSON.stringify({
      event: data.triggerEvent,
      payload: data.payload || {},
      initiatedBy: userId || "SYSTEM",
      createdAt: new Date().toISOString(),
      stepExecutions: [],
      retryCount: 0,
    });

    return this.prisma.$transaction(async (tx) => {
      const execution = await tx.workflowExecution.create({
        data: {
          definitionId: data.definitionId,
          status: WorkflowStatus.PENDING,
          triggerEvent: triggerEventData,
        },
        include: {
          definition: true,
        },
      });

      // Emit Outbox Domain Event
      await tx.outboxMessage.create({
        data: {
          companyId,
          eventType: "WorkflowExecutionCreated",
          payload: {
            executionId: execution.id,
            definitionId: execution.definitionId,
            workflowName: definition.name,
            triggerEvent: data.triggerEvent,
            initiatedBy: userId,
          },
          status: "PENDING",
        },
      });

      return execution;
    });
  }

  /**
   * Update WorkflowExecution status and record lifecycle metadata.
   */
  async updateExecutionStatus(
    companyId: string,
    id: string,
    status: WorkflowStatus | WorkflowExecutionStatusEnum | string,
    metadata?: Record<string, any>
  ) {
    const existing = await this.findExecutionById(companyId, id);
    if (!existing) {
      throw new Error("Workflow execution not found or access denied");
    }

    const prismaStatus = (
      Object.values(WorkflowStatus).includes(status as any)
        ? status
        : status === WorkflowExecutionStatusEnum.COMPLETED || status === "COMPLETED"
        ? WorkflowStatus.APPROVED
        : status === WorkflowExecutionStatusEnum.FAILED || status === "FAILED"
        ? WorkflowStatus.REJECTED
        : WorkflowStatus.PENDING
    ) as WorkflowStatus;

    let triggerJson: Record<string, any> = {};
    try {
      triggerJson = JSON.parse(existing.triggerEvent);
    } catch {
      triggerJson = { raw: existing.triggerEvent };
    }

    const updatedTriggerJson = {
      ...triggerJson,
      statusHistory: [
        ...(triggerJson.statusHistory || []),
        {
          previousStatus: existing.status,
          newStatus: status,
          timestamp: new Date().toISOString(),
          metadata: metadata || {},
        },
      ],
      ...(metadata ? { lastExecutionMetadata: metadata } : {}),
    };

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.workflowExecution.update({
        where: { id },
        data: {
          status: prismaStatus,
          triggerEvent: JSON.stringify(updatedTriggerJson),
        },
        include: {
          definition: true,
        },
      });

      // Map outbox event type based on status
      const eventTypeMap: Record<string, string> = {
        APPROVED: "WorkflowExecutionCompleted",
        REJECTED: "WorkflowExecutionFailed",
        PENDING: "WorkflowExecutionUpdated",
        EXPIRED: "WorkflowExecutionExpired",
      };

      const eventType = eventTypeMap[prismaStatus] || "WorkflowExecutionUpdated";

      await tx.outboxMessage.create({
        data: {
          companyId,
          eventType,
          payload: {
            executionId: id,
            definitionId: existing.definitionId,
            status: prismaStatus,
            metadata: metadata || {},
          },
          status: "PENDING",
        },
      });

      return updated;
    });
  }

  /**
   * Persist execution result for an individual workflow step.
   */
  async updateExecutionStep(companyId: string, executionId: string, data: UpdateExecutionStepInput) {
    const existing = await this.findExecutionById(companyId, executionId);
    if (!existing) {
      throw new Error("Workflow execution not found or access denied");
    }

    let triggerJson: Record<string, any> = {};
    try {
      triggerJson = JSON.parse(existing.triggerEvent);
    } catch {
      triggerJson = { raw: existing.triggerEvent };
    }

    const stepExecutions: any[] = triggerJson.stepExecutions || [];
    const stepRecord = {
      stepId: data.stepId,
      stepName: data.stepName,
      status: data.status,
      input: data.input || {},
      output: data.output || {},
      error: data.error || null,
      durationMs: data.durationMs || 0,
      retryCount: data.retryCount || 0,
      executedAt: new Date().toISOString(),
    };

    const existingIndex = stepExecutions.findIndex((s) => s.stepId === data.stepId);
    if (existingIndex >= 0) {
      stepExecutions[existingIndex] = stepRecord;
    } else {
      stepExecutions.push(stepRecord);
    }

    const updatedTriggerEvent = JSON.stringify({
      ...triggerJson,
      stepExecutions,
    });

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.workflowExecution.update({
        where: { id: executionId },
        data: {
          triggerEvent: updatedTriggerEvent,
        },
        include: {
          definition: true,
        },
      });

      await tx.outboxMessage.create({
        data: {
          companyId,
          eventType: "WorkflowExecutionStepUpdated",
          payload: {
            executionId,
            stepId: data.stepId,
            stepName: data.stepName,
            status: data.status,
          },
          status: "PENDING",
        },
      });

      return updated;
    });
  }

  /**
   * Retry a failed execution by incrementing retry counter and resetting status to PENDING.
   */
  async retryExecution(companyId: string, id: string, userId?: string) {
    const existing = await this.findExecutionById(companyId, id);
    if (!existing) {
      throw new Error("Workflow execution not found or access denied");
    }

    let triggerJson: Record<string, any> = {};
    try {
      triggerJson = JSON.parse(existing.triggerEvent);
    } catch {
      triggerJson = { raw: existing.triggerEvent };
    }

    const currentRetryCount = triggerJson.retryCount || 0;
    const newRetryCount = currentRetryCount + 1;

    const updatedTriggerEvent = JSON.stringify({
      ...triggerJson,
      retryCount: newRetryCount,
      lastRetriedAt: new Date().toISOString(),
      lastRetriedBy: userId || "SYSTEM",
    });

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.workflowExecution.update({
        where: { id },
        data: {
          status: WorkflowStatus.PENDING,
          triggerEvent: updatedTriggerEvent,
        },
        include: {
          definition: true,
        },
      });

      await tx.outboxMessage.create({
        data: {
          companyId,
          eventType: "WorkflowExecutionRetried",
          payload: {
            executionId: id,
            retryCount: newRetryCount,
            retriedBy: userId,
          },
          status: "PENDING",
        },
      });

      return updated;
    });
  }
}

export const workflowExecutionRepository = new WorkflowExecutionRepository();

/**
 * ============================================================================
 * Atlas Commerce OS — Enterprise Workflow Repository Layer
 * ============================================================================
 * Specification Reference: M11-001 / BSD-010 / DAT-001
 * Domain: Workflow Automation Aggregate Root Data Access Layer
 * 
 * Responsibilities:
 * - Multi-tenant WorkflowDefinition aggregate persistence (companyId isolated)
 * - Version history management within aggregate rules JSON
 * - Workflow trigger, step, and activation state management
 * - Optimistic concurrency and transactional domain Outbox event creation
 * ============================================================================
 */

import { BaseRepository } from "./base/base.repository";
import { Prisma } from "@prisma/client";
import {
  CreateWorkflowInput,
  UpdateWorkflowInput,
  WorkflowQueryInput,
  CreateWorkflowVersionInput,
  WorkflowRules,
} from "../types/workflow.dto";

export class WorkflowRepository extends BaseRepository {
  /**
   * Find paginated WorkflowDefinition aggregates for a specific tenant.
   */
  async findMany(companyId: string, query: WorkflowQueryInput) {
    const { page = 1, limit = 20, search, workflowType, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.WorkflowDefinitionWhereInput = {
      companyId,
      ...(isActive !== undefined ? { isActive } : {}),
      ...(workflowType ? { workflowType: workflowType as any } : {}),
      ...(search
        ? {
            name: { contains: search, mode: "insensitive" },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.workflowDefinition.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          executions: {
            take: 5,
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      this.prisma.workflowDefinition.count({ where }),
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
   * Find a single WorkflowDefinition by ID for a tenant.
   */
  async findById(companyId: string, id: string) {
    return this.prisma.workflowDefinition.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        executions: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  /**
   * Find a WorkflowDefinition by unique code within rules JSON.
   */
  async findByCode(companyId: string, code: string) {
    const workflows = await this.prisma.workflowDefinition.findMany({
      where: { companyId },
    });

    return workflows.find((wf) => {
      const rules = wf.rules as Record<string, any>;
      return rules?.code === code;
    }) || null;
  }

  /**
   * Create a new WorkflowDefinition aggregate with Outbox event emission.
   */
  async create(companyId: string, data: CreateWorkflowInput, userId?: string) {
    const rules: WorkflowRules = {
      ...data.rules,
      version: data.rules.version || 1,
      metadata: {
        ...(data.rules.metadata || {}),
        createdBy: userId || "SYSTEM",
        createdAt: new Date().toISOString(),
      },
    };

    return this.prisma.$transaction(async (tx) => {
      const workflow = await tx.workflowDefinition.create({
        data: {
          id: (data as any).id || `wf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          companyId,
          name: data.name,
          workflowType: data.workflowType as any,
          rules: rules as any,
          isActive: data.isActive ?? true,
        },
      });

      // Emit Outbox Domain Event
      await tx.outboxMessage.create({
        data: {
          companyId,
          eventType: "WorkflowCreated",
          payload: {
            workflowId: workflow.id,
            name: workflow.name,
            workflowType: workflow.workflowType,
            version: rules.version,
            createdBy: userId,
          },
          status: "PENDING",
        },
      });

      return workflow;
    });
  }

  /**
   * Update existing WorkflowDefinition aggregate with optimistic concurrency.
   */
  async update(
    companyId: string,
    id: string,
    data: UpdateWorkflowInput,
    userId?: string,
    expectedVersion?: number
  ) {
    const existing = await this.findById(companyId, id);
    if (!existing) {
      throw new Error("Workflow definition not found or access denied");
    }

    const currentRules = existing.rules as Record<string, any>;
    const currentVersion = currentRules?.version || 1;

    if (expectedVersion !== undefined && currentVersion !== expectedVersion) {
      throw new Error(
        `Optimistic concurrency conflict: Expected version ${expectedVersion}, but current version is ${currentVersion}`
      );
    }

    const newVersion = currentVersion + 1;
    const updatedRules: WorkflowRules = {
      ...(data.rules || (currentRules as any)),
      version: newVersion,
      metadata: {
        ...(currentRules?.metadata || {}),
        ...(data.rules?.metadata || {}),
        updatedBy: userId || "SYSTEM",
        updatedAt: new Date().toISOString(),
      },
    };

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.workflowDefinition.update({
        where: { id },
        data: {
          ...(data.name ? { name: data.name } : {}),
          ...(data.workflowType ? { workflowType: data.workflowType as any } : {}),
          ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
          rules: updatedRules as any,
        },
      });

      // Emit Outbox Domain Event
      await tx.outboxMessage.create({
        data: {
          companyId,
          eventType: "WorkflowUpdated",
          payload: {
            workflowId: updated.id,
            name: updated.name,
            version: newVersion,
            updatedBy: userId,
          },
          status: "PENDING",
        },
      });

      return updated;
    });
  }

  /**
   * Activate workflow definition.
   */
  async activate(companyId: string, id: string, userId?: string) {
    const existing = await this.findById(companyId, id);
    if (!existing) {
      throw new Error("Workflow definition not found or access denied");
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.workflowDefinition.update({
        where: { id },
        data: { isActive: true },
      });

      await tx.outboxMessage.create({
        data: {
          companyId,
          eventType: "WorkflowActivated",
          payload: { workflowId: id, activatedBy: userId },
          status: "PENDING",
        },
      });

      return updated;
    });
  }

  /**
   * Deactivate workflow definition.
   */
  async deactivate(companyId: string, id: string, userId?: string) {
    const existing = await this.findById(companyId, id);
    if (!existing) {
      throw new Error("Workflow definition not found or access denied");
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.workflowDefinition.update({
        where: { id },
        data: { isActive: false },
      });

      await tx.outboxMessage.create({
        data: {
          companyId,
          eventType: "WorkflowDeactivated",
          payload: { workflowId: id, deactivatedBy: userId },
          status: "PENDING",
        },
      });

      return updated;
    });
  }

  /**
   * Soft archive workflow definition (deactivate and flag in rules metadata).
   */
  async archive(companyId: string, id: string, userId?: string) {
    const existing = await this.findById(companyId, id);
    if (!existing) {
      throw new Error("Workflow definition not found or access denied");
    }

    const currentRules = existing.rules as Record<string, any>;
    const updatedRules = {
      ...currentRules,
      metadata: {
        ...(currentRules?.metadata || {}),
        archivedAt: new Date().toISOString(),
        archivedBy: userId || "SYSTEM",
      },
    };

    return this.prisma.$transaction(async (tx) => {
      const archived = await tx.workflowDefinition.update({
        where: { id },
        data: {
          isActive: false,
          rules: updatedRules,
        },
      });

      await tx.outboxMessage.create({
        data: {
          companyId,
          eventType: "WorkflowArchived",
          payload: { workflowId: id, archivedBy: userId },
          status: "PENDING",
        },
      });

      return archived;
    });
  }

  // ==========================================
  // VERSION MANAGEMENT METHODS
  // ==========================================

  /**
   * Create and append a new workflow version.
   */
  async createVersion(
    companyId: string,
    id: string,
    data: CreateWorkflowVersionInput,
    userId?: string
  ) {
    const existing = await this.findById(companyId, id);
    if (!existing) {
      throw new Error("Workflow definition not found or access denied");
    }

    const currentRules = existing.rules as Record<string, any>;
    const currentVersion = currentRules?.version || 1;
    const newVersionNumber = currentVersion + 1;

    const existingVersions = (currentRules?.versionHistory as any[]) || [];
    const versionRecord = {
      version: currentVersion,
      rules: currentRules,
      description: data.description || `Version ${currentVersion} snapshot`,
      createdAt: new Date().toISOString(),
      createdBy: userId || "SYSTEM",
    };

    const newRules: WorkflowRules = {
      ...data.rules,
      version: newVersionNumber,
      metadata: {
        ...(data.rules.metadata || {}),
        updatedBy: userId || "SYSTEM",
        updatedAt: new Date().toISOString(),
      },
    };

    const rulesPayload = {
      ...newRules,
      versionHistory: [...existingVersions, versionRecord],
    };

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.workflowDefinition.update({
        where: { id },
        data: {
          rules: rulesPayload as any,
        },
      });

      await tx.outboxMessage.create({
        data: {
          companyId,
          eventType: "WorkflowVersionCreated",
          payload: {
            workflowId: id,
            version: newVersionNumber,
            createdBy: userId,
          },
          status: "PENDING",
        },
      });

      return updated;
    });
  }

  /**
   * Find all versions for a workflow definition.
   */
  async findVersions(companyId: string, id: string) {
    const existing = await this.findById(companyId, id);
    if (!existing) {
      throw new Error("Workflow definition not found or access denied");
    }

    const currentRules = existing.rules as Record<string, any>;
    const versionHistory = (currentRules?.versionHistory as any[]) || [];

    const activeVersion = {
      version: currentRules?.version || 1,
      rules: currentRules,
      isCurrent: true,
      createdAt: existing.createdAt.toISOString(),
    };

    return [activeVersion, ...versionHistory.map((v) => ({ ...v, isCurrent: false }))];
  }

  /**
   * Publish a specific workflow version.
   */
  async publishVersion(companyId: string, id: string, versionNumber: number, userId?: string) {
    const existing = await this.findById(companyId, id);
    if (!existing) {
      throw new Error("Workflow definition not found or access denied");
    }

    const currentRules = existing.rules as Record<string, any>;
    if (currentRules?.version === versionNumber) {
      return existing; // Already active version
    }

    const versionHistory = (currentRules?.versionHistory as any[]) || [];
    const targetVersion = versionHistory.find((v) => v.version === versionNumber);

    if (!targetVersion) {
      throw new Error(`Version ${versionNumber} not found in workflow history`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.workflowDefinition.update({
        where: { id },
        data: {
          rules: {
            ...targetVersion.rules,
            version: versionNumber,
            versionHistory,
          },
          isActive: true,
        },
      });

      await tx.outboxMessage.create({
        data: {
          companyId,
          eventType: "WorkflowPublished",
          payload: {
            workflowId: id,
            publishedVersion: versionNumber,
            publishedBy: userId,
          },
          status: "PENDING",
        },
      });

      return updated;
    });
  }
}

export const workflowRepository = new WorkflowRepository();

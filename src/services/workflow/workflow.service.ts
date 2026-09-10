/**
 * ============================================================================
 * Atlas Commerce OS — Workflow Definition Service
 * ============================================================================
 * Specification Reference: M11-002 / BSD-010 / SAD-001
 * Domain: Workflow Definition & Versioning Management Service
 * 
 * Responsibilities:
 * - Domain orchestration for workflow definition CRUD
 * - Policy validation via WorkflowPolicy
 * - Version management (create, list, publish, clone)
 * - Activation/deactivation & soft archiving
 * - Audit logging via AuditService
 * - Multi-tenant security enforcement
 * ============================================================================
 */

import { workflowRepository, WorkflowRepository } from "../../repositories/workflow.repository";
import { auditService, AuditService } from "../audit.service";
import { workflowPolicy, WorkflowPolicy } from "./workflow.policy";
import { AuditAction } from "@prisma/client";
import {
  CreateWorkflowInput,
  UpdateWorkflowInput,
  WorkflowQueryInput,
  CreateWorkflowVersionInput,
  CreateWorkflowSchema,
  UpdateWorkflowSchema,
  WorkflowQuerySchema,
  WorkflowTypeEnum,
  WorkflowTriggerTypeEnum,
  WorkflowStepTypeEnum,
} from "../../types/workflow.dto";

export class WorkflowDefinitionService {
  constructor(
    private readonly repo: WorkflowRepository = workflowRepository,
    private readonly audit: AuditService = auditService,
    private readonly policy: WorkflowPolicy = workflowPolicy
  ) {}

  /**
   * Create a new workflow definition.
   */
  async createWorkflow(companyId: string, data: CreateWorkflowInput, userId?: string) {
    if (!companyId) throw new Error("Tenant companyId is required");

    const validated = CreateWorkflowSchema.parse(data);
    this.policy.validateWorkflowRules(validated.rules);

    const workflow = await this.repo.create(companyId, validated, userId);

    await this.audit.log({
      companyId,
      userId,
      action: AuditAction.USER_CREATED, // Standard audit action
      entityName: "WorkflowDefinition",
      entityId: workflow.id,
      details: {
        operation: "CREATE_WORKFLOW",
        name: workflow.name,
        workflowType: workflow.workflowType,
      },
    });

    return workflow;
  }

  /**
   * Find workflow definition by ID.
   */
  async getWorkflow(companyId: string, id: string) {
    if (!companyId) throw new Error("Tenant companyId is required");
    const workflow = await this.repo.findById(companyId, id);
    if (!workflow) {
      throw new Error(`Workflow definition ${id} not found or access denied`);
    }
    return workflow;
  }

  /**
   * List paginated workflow definitions.
   */
  async listWorkflows(companyId: string, query: WorkflowQueryInput) {
    if (!companyId) throw new Error("Tenant companyId is required");
    const validatedQuery = WorkflowQuerySchema.parse(query);
    return this.repo.findMany(companyId, validatedQuery);
  }

  /**
   * Update workflow definition properties.
   */
  async updateWorkflow(
    companyId: string,
    id: string,
    data: UpdateWorkflowInput,
    userId?: string,
    expectedVersion?: number
  ) {
    if (!companyId) throw new Error("Tenant companyId is required");

    const existing = await this.getWorkflow(companyId, id);
    const rules = existing.rules as any;
    this.policy.validateWorkflowLifecycle(existing.isActive, !!rules?.metadata?.archivedAt, "UPDATE");

    const validated = UpdateWorkflowSchema.parse(data);
    if (validated.rules) {
      this.policy.validateWorkflowRules(validated.rules);
    }

    const updated = await this.repo.update(companyId, id, validated, userId, expectedVersion);

    await this.audit.log({
      companyId,
      userId,
      action: AuditAction.USER_UPDATED,
      entityName: "WorkflowDefinition",
      entityId: id,
      details: {
        operation: "UPDATE_WORKFLOW",
        version: (updated.rules as any)?.version,
      },
    });

    return updated;
  }

  /**
   * Activate workflow definition.
   */
  async activateWorkflow(companyId: string, id: string, userId?: string) {
    if (!companyId) throw new Error("Tenant companyId is required");

    const existing = await this.getWorkflow(companyId, id);
    const rules = existing.rules as any;
    this.policy.validateWorkflowLifecycle(existing.isActive, !!rules?.metadata?.archivedAt, "ACTIVATE");

    const updated = await this.repo.activate(companyId, id, userId);

    await this.audit.log({
      companyId,
      userId,
      action: AuditAction.USER_UPDATED,
      entityName: "WorkflowDefinition",
      entityId: id,
      details: { operation: "ACTIVATE_WORKFLOW" },
    });

    return updated;
  }

  /**
   * Deactivate workflow definition.
   */
  async deactivateWorkflow(companyId: string, id: string, userId?: string) {
    if (!companyId) throw new Error("Tenant companyId is required");

    const existing = await this.getWorkflow(companyId, id);
    const rules = existing.rules as any;
    this.policy.validateWorkflowLifecycle(existing.isActive, !!rules?.metadata?.archivedAt, "DEACTIVATE");

    const updated = await this.repo.deactivate(companyId, id, userId);

    await this.audit.log({
      companyId,
      userId,
      action: AuditAction.USER_UPDATED,
      entityName: "WorkflowDefinition",
      entityId: id,
      details: { operation: "DEACTIVATE_WORKFLOW" },
    });

    return updated;
  }

  /**
   * Soft archive workflow definition.
   */
  async archiveWorkflow(companyId: string, id: string, userId?: string) {
    if (!companyId) throw new Error("Tenant companyId is required");

    const existing = await this.getWorkflow(companyId, id);
    const rules = existing.rules as any;
    this.policy.validateWorkflowLifecycle(existing.isActive, !!rules?.metadata?.archivedAt, "ARCHIVE");

    const archived = await this.repo.archive(companyId, id, userId);

    await this.audit.log({
      companyId,
      userId,
      action: AuditAction.USER_UPDATED,
      entityName: "WorkflowDefinition",
      entityId: id,
      details: { operation: "ARCHIVE_WORKFLOW" },
    });

    return archived;
  }

  // ==========================================
  // VERSION MANAGEMENT
  // ==========================================

  /**
   * Create a new version snapshot for a workflow definition.
   */
  async createVersion(
    companyId: string,
    id: string,
    data: CreateWorkflowVersionInput,
    userId?: string
  ) {
    if (!companyId) throw new Error("Tenant companyId is required");

    const existing = await this.getWorkflow(companyId, id);
    this.policy.validateWorkflowRules(data.rules);

    const updated = await this.repo.createVersion(companyId, id, data, userId);

    await this.audit.log({
      companyId,
      userId,
      action: AuditAction.USER_UPDATED,
      entityName: "WorkflowDefinition",
      entityId: id,
      details: {
        operation: "CREATE_WORKFLOW_VERSION",
        newVersion: (updated.rules as any)?.version,
      },
    });

    return updated;
  }

  /**
   * List version history for a workflow definition.
   */
  async listVersions(companyId: string, id: string) {
    if (!companyId) throw new Error("Tenant companyId is required");
    await this.getWorkflow(companyId, id); // Validate tenant ownership
    return this.repo.findVersions(companyId, id);
  }

  /**
   * Publish a specific historical version as active.
   */
  async publishVersion(
    companyId: string,
    id: string,
    versionNumber: number,
    userId?: string
  ) {
    if (!companyId) throw new Error("Tenant companyId is required");

    const existing = await this.getWorkflow(companyId, id);
    const published = await this.repo.publishVersion(companyId, id, versionNumber, userId);

    await this.audit.log({
      companyId,
      userId,
      action: AuditAction.USER_UPDATED,
      entityName: "WorkflowDefinition",
      entityId: id,
      details: {
        operation: "PUBLISH_WORKFLOW_VERSION",
        publishedVersion: versionNumber,
      },
    });

    return published;
  }

  /**
   * Clone a historical or current version as a brand-new workflow definition.
   */
  async cloneVersion(
    companyId: string,
    id: string,
    versionNumber: number,
    newName?: string,
    userId?: string
  ) {
    if (!companyId) throw new Error("Tenant companyId is required");

    const versions = await this.listVersions(companyId, id);
    const targetVersion = versions.find((v) => v.version === versionNumber);

    if (!targetVersion) {
      throw new Error(`Version ${versionNumber} not found in workflow history`);
    }

    const existing = await this.getWorkflow(companyId, id);

    const cloned = await this.createWorkflow(
      companyId,
      {
        name: newName || `${existing.name} (Cloned v${versionNumber})`,
        workflowType: existing.workflowType as any,
        isActive: true,
        rules: {
          ...targetVersion.rules,
          version: 1,
          code: `CLONE_${Date.now()}`,
          metadata: {
            clonedFromWorkflowId: id,
            clonedFromVersion: versionNumber,
          },
        },
      },
      userId
    );

    return cloned;
  }
}

export const workflowDefinitionService = new WorkflowDefinitionService();

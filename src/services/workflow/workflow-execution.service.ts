/**
 * ============================================================================
 * Atlas Commerce OS — Workflow Execution Service
 * ============================================================================
 * Specification Reference: M11-002 / BSD-010 / SAD-001
 * Domain: Workflow Execution & Step State Orchestration Service
 * 
 * Responsibilities:
 * - Runtime workflow execution creation and status orchestration
 * - Execution lifecycle validation via WorkflowPolicy
 * - Step execution status transitions (RUNNING, COMPLETED, FAILED, SKIPPED)
 * - Step input, output, error, and duration tracking
 * - Retry policy evaluation and execution retries
 * - Multi-tenant security & AuditService logging
 * ============================================================================
 */

import {
  workflowExecutionRepository,
  WorkflowExecutionRepository,
} from "../../repositories/workflow-execution.repository";
import { workflowRepository, WorkflowRepository } from "../../repositories/workflow.repository";
import { auditService, AuditService } from "../audit.service";
import { workflowPolicy, WorkflowPolicy } from "./workflow.policy";
import { AuditAction, WorkflowStatus } from "@prisma/client";
import {
  CreateWorkflowExecutionInput,
  WorkflowExecutionQueryInput,
  UpdateExecutionStepInput,
  WorkflowExecutionStatusEnum,
  CreateWorkflowExecutionSchema,
  WorkflowExecutionQuerySchema,
} from "../../types/workflow.dto";

export class WorkflowExecutionService {
  constructor(
    private readonly executionRepo: WorkflowExecutionRepository = workflowExecutionRepository,
    private readonly workflowRepo: WorkflowRepository = workflowRepository,
    private readonly audit: AuditService = auditService,
    private readonly policy: WorkflowPolicy = workflowPolicy
  ) {}

  /**
   * Instantiate a new execution for an active workflow definition.
   */
  async createExecution(companyId: string, data: CreateWorkflowExecutionInput, userId?: string) {
    if (!companyId) throw new Error("Tenant companyId is required");

    const validated = CreateWorkflowExecutionSchema.parse(data);

    // Validate workflow definition eligibility
    const definition = await this.workflowRepo.findById(companyId, validated.definitionId);
    if (!definition) {
      throw new Error(`Workflow definition ${validated.definitionId} not found or access denied`);
    }

    this.policy.validateExecutionEligibility(definition);

    const execution = await this.executionRepo.createExecution(companyId, validated, userId);

    await this.audit.log({
      companyId,
      userId,
      action: AuditAction.USER_CREATED,
      entityName: "WorkflowExecution",
      entityId: execution.id,
      details: {
        operation: "CREATE_EXECUTION",
        definitionId: execution.definitionId,
        triggerEvent: validated.triggerEvent,
      },
    });

    return execution;
  }

  /**
   * Get WorkflowExecution by ID for tenant.
   */
  async getExecution(companyId: string, id: string) {
    if (!companyId) throw new Error("Tenant companyId is required");
    const execution = await this.executionRepo.findExecutionById(companyId, id);
    if (!execution) {
      throw new Error(`Workflow execution ${id} not found or access denied`);
    }
    return execution;
  }

  /**
   * List paginated WorkflowExecutions.
   */
  async listExecutions(companyId: string, query: WorkflowExecutionQueryInput) {
    if (!companyId) throw new Error("Tenant companyId is required");
    const validatedQuery = WorkflowExecutionQuerySchema.parse(query);
    return this.executionRepo.findExecutions(companyId, validatedQuery);
  }

  /**
   * Start executing a pending workflow execution instance.
   */
  async startExecution(companyId: string, id: string, userId?: string) {
    if (!companyId) throw new Error("Tenant companyId is required");

    const existing = await this.getExecution(companyId, id);
    this.policy.validateExecutionStatusTransition(existing.status, "RUNNING");

    const updated = await this.executionRepo.updateExecutionStatus(companyId, id, WorkflowStatus.PENDING, {
      startedAt: new Date().toISOString(),
      startedBy: userId || "SYSTEM",
    });

    await this.audit.log({
      companyId,
      userId,
      action: AuditAction.USER_UPDATED,
      entityName: "WorkflowExecution",
      entityId: id,
      details: { operation: "START_EXECUTION" },
    });

    return updated;
  }

  /**
   * Record step execution payload, status, and duration metrics.
   */
  async executeStep(companyId: string, executionId: string, stepInput: UpdateExecutionStepInput) {
    if (!companyId) throw new Error("Tenant companyId is required");

    await this.getExecution(companyId, executionId); // Validate tenant access
    return this.executionRepo.updateExecutionStep(companyId, executionId, stepInput);
  }

  /**
   * Mark a step as COMPLETED.
   */
  async completeStep(
    companyId: string,
    executionId: string,
    stepId: string,
    stepName: string,
    output?: Record<string, any>,
    durationMs = 0
  ) {
    return this.executeStep(companyId, executionId, {
      stepId,
      stepName,
      status: WorkflowExecutionStatusEnum.COMPLETED,
      output,
      durationMs,
    });
  }

  /**
   * Mark a step as FAILED.
   */
  async failStep(
    companyId: string,
    executionId: string,
    stepId: string,
    stepName: string,
    error: string,
    durationMs = 0
  ) {
    return this.executeStep(companyId, executionId, {
      stepId,
      stepName,
      status: WorkflowExecutionStatusEnum.FAILED,
      error,
      durationMs,
    });
  }

  /**
   * Mark a step as SKIPPED.
   */
  async skipStep(companyId: string, executionId: string, stepId: string, stepName: string) {
    return this.executeStep(companyId, executionId, {
      stepId,
      stepName,
      status: WorkflowExecutionStatusEnum.SKIPPED,
    });
  }

  /**
   * Mark workflow execution as APPROVED / COMPLETED.
   */
  async completeExecution(companyId: string, id: string, metadata?: Record<string, any>) {
    if (!companyId) throw new Error("Tenant companyId is required");

    const existing = await this.getExecution(companyId, id);
    this.policy.validateExecutionStatusTransition(existing.status, "APPROVED");

    const updated = await this.executionRepo.updateExecutionStatus(companyId, id, WorkflowStatus.APPROVED, {
      completedAt: new Date().toISOString(),
      ...(metadata || {}),
    });

    await this.audit.log({
      companyId,
      action: AuditAction.USER_UPDATED,
      entityName: "WorkflowExecution",
      entityId: id,
      details: { operation: "COMPLETE_EXECUTION", status: "APPROVED" },
    });

    return updated;
  }

  /**
   * Mark workflow execution as REJECTED / FAILED.
   */
  async failExecution(companyId: string, id: string, errorDetails?: string | Record<string, any>) {
    if (!companyId) throw new Error("Tenant companyId is required");

    const existing = await this.getExecution(companyId, id);
    this.policy.validateExecutionStatusTransition(existing.status, "REJECTED");

    const errorPayload = typeof errorDetails === "string" ? { error: errorDetails } : errorDetails || {};

    const updated = await this.executionRepo.updateExecutionStatus(companyId, id, WorkflowStatus.REJECTED, {
      failedAt: new Date().toISOString(),
      ...errorPayload,
    });

    await this.audit.log({
      companyId,
      action: AuditAction.USER_UPDATED,
      entityName: "WorkflowExecution",
      entityId: id,
      details: { operation: "FAIL_EXECUTION", status: "REJECTED", errorPayload },
    });

    return updated;
  }

  /**
   * Cancel workflow execution.
   */
  async cancelExecution(companyId: string, id: string, userId?: string) {
    if (!companyId) throw new Error("Tenant companyId is required");

    const existing = await this.getExecution(companyId, id);
    this.policy.validateExecutionStatusTransition(existing.status, "CANCELLED");

    const updated = await this.executionRepo.updateExecutionStatus(companyId, id, WorkflowStatus.REJECTED, {
      cancelledAt: new Date().toISOString(),
      cancelledBy: userId || "SYSTEM",
      isCancelled: true,
    });

    await this.audit.log({
      companyId,
      userId,
      action: AuditAction.USER_UPDATED,
      entityName: "WorkflowExecution",
      entityId: id,
      details: { operation: "CANCEL_EXECUTION" },
    });

    return updated;
  }

  /**
   * Retry a failed workflow execution according to Retry Policy constraints.
   */
  async retryExecution(companyId: string, id: string, userId?: string) {
    if (!companyId) throw new Error("Tenant companyId is required");

    const existing = await this.getExecution(companyId, id);

    let triggerJson: Record<string, any> = {};
    try {
      triggerJson = JSON.parse(existing.triggerEvent);
    } catch {
      triggerJson = {};
    }

    const currentRetryCount = triggerJson.retryCount || 0;
    this.policy.validateRetryEligibility(existing.status, currentRetryCount, 3);

    const retried = await this.executionRepo.retryExecution(companyId, id, userId);

    await this.audit.log({
      companyId,
      userId,
      action: AuditAction.USER_UPDATED,
      entityName: "WorkflowExecution",
      entityId: id,
      details: {
        operation: "RETRY_EXECUTION",
        retryCount: currentRetryCount + 1,
      },
    });

    return retried;
  }
}

export const workflowExecutionService = new WorkflowExecutionService();

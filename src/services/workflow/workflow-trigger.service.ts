/**
 * ============================================================================
 * Atlas Commerce OS — Workflow Trigger Service
 * ============================================================================
 * Specification Reference: M11-002 / BSD-010 / SAD-001
 * Domain: Workflow Event Matching & Automated Execution Trigger Service
 * 
 * Responsibilities:
 * - Event evaluation and matching against active workflow definitions
 * - Automatic WorkflowExecution creation for matching triggers
 * - Prevention of duplicate or invalid executions
 * - Multi-tenant security enforcement & AuditService integration
 * ============================================================================
 */

import { workflowRepository, WorkflowRepository } from "../../repositories/workflow.repository";
import {
  workflowExecutionRepository,
  WorkflowExecutionRepository,
} from "../../repositories/workflow-execution.repository";
import { auditService, AuditService } from "../audit.service";
import { workflowPolicy, WorkflowPolicy } from "./workflow.policy";
import { AuditAction } from "@prisma/client";

export class WorkflowTriggerService {
  constructor(
    private readonly workflowRepo: WorkflowRepository = workflowRepository,
    private readonly executionRepo: WorkflowExecutionRepository = workflowExecutionRepository,
    private readonly audit: AuditService = auditService,
    private readonly policy: WorkflowPolicy = workflowPolicy
  ) {}

  /**
   * Find active workflow definitions matching an incoming eventName for a tenant.
   */
  async findMatchingWorkflows(companyId: string, eventName: string) {
    if (!companyId) throw new Error("Tenant companyId is required");
    if (!eventName) throw new Error("Event name is required for trigger evaluation");

    const activeWorkflows = await this.workflowRepo.findMany(companyId, {
      page: 1,
      isActive: true,
      limit: 100,
    });

    return activeWorkflows.items.filter((wf) => {
      const rules = wf.rules as any;
      if (rules?.metadata?.archivedAt) return false;

      const triggers: any[] = rules?.triggers || [];
      return triggers.some(
        (t) => t.enabled !== false && t.eventName === eventName
      );
    });
  }

  /**
   * Evaluate event triggers against active workflows and return matching workflow IDs.
   */
  async evaluateTriggers(companyId: string, eventName: string, payload?: Record<string, any>) {
    const matchingWorkflows = await this.findMatchingWorkflows(companyId, eventName);

    return {
      eventName,
      matchingCount: matchingWorkflows.length,
      matchingWorkflowIds: matchingWorkflows.map((w) => w.id),
      payload: payload || {},
    };
  }

  /**
   * Instantiate an execution for a matched workflow definition.
   */
  async createTriggeredExecution(
    companyId: string,
    definitionId: string,
    eventName: string,
    payload?: Record<string, any>,
    userId?: string
  ) {
    const definition = await this.workflowRepo.findById(companyId, definitionId);
    if (!definition) {
      throw new Error(`Workflow definition ${definitionId} not found or access denied`);
    }

    this.policy.validateExecutionEligibility(definition);

    const execution = await this.executionRepo.createExecution(
      companyId,
      {
        definitionId,
        triggerEvent: eventName,
        payload: payload || {},
      },
      userId
    );

    await this.audit.log({
      companyId,
      userId,
      action: AuditAction.USER_CREATED,
      entityName: "WorkflowExecution",
      entityId: execution.id,
      details: {
        operation: "TRIGGERED_EXECUTION_CREATED",
        eventName,
        definitionId,
      },
    });

    return execution;
  }

  /**
   * Process incoming domain event: evaluate triggers and instantiate executions for all matching workflows.
   */
  async processTriggerEvent(
    companyId: string,
    eventName: string,
    payload?: Record<string, any>,
    userId?: string
  ) {
    if (!companyId) throw new Error("Tenant companyId is required");

    const matchingWorkflows = await this.findMatchingWorkflows(companyId, eventName);
    const createdExecutions = [];

    for (const wf of matchingWorkflows) {
      try {
        const execution = await this.createTriggeredExecution(
          companyId,
          wf.id,
          eventName,
          payload,
          userId
        );
        createdExecutions.push(execution);
      } catch (err: any) {
        console.error(`⚠️ Failed to trigger workflow ${wf.id} for event ${eventName}:`, err.message);
      }
    }

    return {
      eventName,
      evaluatedCount: matchingWorkflows.length,
      createdCount: createdExecutions.length,
      executions: createdExecutions,
    };
  }
}

export const workflowTriggerService = new WorkflowTriggerService();

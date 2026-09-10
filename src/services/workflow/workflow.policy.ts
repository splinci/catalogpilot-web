/**
 * ============================================================================
 * Atlas Commerce OS — Workflow Policy Engine
 * ============================================================================
 * Specification Reference: M11-002 / BSD-010 / SAD-001
 * Domain: Workflow Business Policy & State Transition Validation Engine
 * 
 * Responsibilities:
 * - Validate workflow definition lifecycle state transitions
 * - Validate trigger and step configurations
 * - Validate workflow execution eligibility and state transitions
 * - Validate approval decision rules and duplicate protection
 * - Validate retry and backoff constraints
 * 
 * Note: Pure domain policy logic. No direct Prisma or DB access.
 * ============================================================================
 */

import {
  WorkflowTypeEnum,
  WorkflowTriggerTypeEnum,
  WorkflowStepTypeEnum,
  WorkflowStatusEnum,
  WorkflowExecutionStatusEnum,
  WorkflowTrigger,
  WorkflowStep,
  WorkflowRules,
} from "../../types/workflow.dto";

export class WorkflowPolicy {
  /**
   * Validate workflow definition activation, deactivation, and archiving actions.
   */
  validateWorkflowLifecycle(
    isActive: boolean,
    isArchived: boolean,
    action: "ACTIVATE" | "DEACTIVATE" | "ARCHIVE" | "UPDATE"
  ): void {
    if (isArchived) {
      throw new Error("Cannot perform operation on an archived workflow definition");
    }

    if (action === "ACTIVATE" && isActive) {
      throw new Error("Workflow definition is already active");
    }

    if (action === "DEACTIVATE" && !isActive) {
      throw new Error("Workflow definition is already inactive");
    }
  }

  /**
   * Validate workflow trigger configuration.
   */
  validateTrigger(trigger: WorkflowTrigger): void {
    if (!trigger.triggerType) {
      throw new Error("Workflow trigger must specify a valid triggerType");
    }

    if (trigger.triggerType === WorkflowTriggerTypeEnum.EVENT && !trigger.eventName) {
      throw new Error("Event-based triggers must specify an eventName");
    }

    if (trigger.triggerType === WorkflowTriggerTypeEnum.SCHEDULED && !trigger.cronExpression) {
      throw new Error("Scheduled triggers must specify a cronExpression");
    }
  }

  /**
   * Validate workflow step array and step ordering/dependencies.
   */
  validateSteps(steps: WorkflowStep[]): void {
    if (!Array.isArray(steps)) {
      throw new Error("Workflow steps must be an array");
    }

    const stepIds = new Set<string>();
    for (const step of steps) {
      if (!step.id) {
        throw new Error("Each workflow step must possess a unique id");
      }
      if (stepIds.has(step.id)) {
        throw new Error(`Duplicate step ID detected: ${step.id}`);
      }
      stepIds.add(step.id);

      if (!step.name || !step.action) {
        throw new Error(`Step ${step.id} must specify both name and action`);
      }
    }

    // Validate nextStepId references
    for (const step of steps) {
      if (step.nextStepId && !stepIds.has(step.nextStepId)) {
        throw new Error(`Step ${step.id} references invalid nextStepId: ${step.nextStepId}`);
      }
      if (step.onFailureStepId && !stepIds.has(step.onFailureStepId)) {
        throw new Error(`Step ${step.id} references invalid onFailureStepId: ${step.onFailureStepId}`);
      }
    }
  }

  /**
   * Validate full WorkflowRules object.
   */
  validateWorkflowRules(rules: WorkflowRules): void {
    if (rules.triggers) {
      rules.triggers.forEach((t) => this.validateTrigger(t));
    }
    if (rules.steps) {
      this.validateSteps(rules.steps);
    }
  }

  /**
   * Validate workflow execution creation eligibility.
   */
  validateExecutionEligibility(workflowDefinition: { isActive: boolean; rules?: any }): void {
    if (!workflowDefinition) {
      throw new Error("Workflow definition not found");
    }
    if (!workflowDefinition.isActive) {
      throw new Error("Cannot instantiate execution for an inactive workflow definition");
    }

    const metadata = (workflowDefinition.rules as any)?.metadata;
    if (metadata?.archivedAt) {
      throw new Error("Cannot instantiate execution for an archived workflow definition");
    }
  }

  /**
   * Validate WorkflowExecution status transitions.
   */
  validateExecutionStatusTransition(
    currentStatus: string,
    targetStatus: string
  ): void {
    const validTransitions: Record<string, string[]> = {
      PENDING: ["RUNNING", "CANCELLED", "EXPIRED", "APPROVED", "REJECTED"],
      RUNNING: ["COMPLETED", "FAILED", "APPROVED", "REJECTED", "CANCELLED"],
      APPROVED: [], // Terminal
      COMPLETED: [], // Terminal
      REJECTED: [], // Terminal
      FAILED: ["PENDING", "RETRYING", "CANCELLED"], // Retryable
      EXPIRED: [], // Terminal
      CANCELLED: [], // Terminal
      RETRYING: ["RUNNING", "FAILED", "CANCELLED"],
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      throw new Error(
        `Invalid execution status transition from ${currentStatus} to ${targetStatus}`
      );
    }
  }

  /**
   * Validate approval decision eligibility.
   */
  validateApprovalEligibility(
    execution: { status: string; triggerEvent?: string },
    userId?: string
  ): void {
    if (!execution) {
      throw new Error("Workflow execution not found");
    }

    if (execution.status !== "PENDING" && execution.status !== "RUNNING") {
      throw new Error(`Cannot record approval decision for execution in ${execution.status} status`);
    }

    if (!userId) {
      throw new Error("Approval decisions require an authenticated userId");
    }

    // Check if decision already recorded
    let triggerJson: Record<string, any> = {};
    try {
      triggerJson = typeof execution.triggerEvent === "string" ? JSON.parse(execution.triggerEvent) : execution.triggerEvent || {};
    } catch {
      triggerJson = {};
    }

    if (triggerJson.approvalDecision) {
      throw new Error("Approval decision has already been recorded for this execution");
    }
  }

  /**
   * Validate retry eligibility for a failed execution.
   */
  validateRetryEligibility(
    executionStatus: string,
    currentRetryCount: number,
    maxRetries = 3
  ): void {
    if (executionStatus !== "FAILED" && executionStatus !== WorkflowExecutionStatusEnum.FAILED) {
      throw new Error(`Only FAILED executions can be retried (current status: ${executionStatus})`);
    }

    if (currentRetryCount >= maxRetries) {
      throw new Error(
        `Maximum retry limit reached (${currentRetryCount}/${maxRetries}). Execution cannot be retried further.`
      );
    }
  }
}

export const workflowPolicy = new WorkflowPolicy();

/**
 * ============================================================================
 * Atlas Commerce OS — Workflow Subsystem Facade
 * ============================================================================
 * Specification Reference: M11-002 / BSD-010 / SAD-001
 * Central entrypoint for all workflow definition, execution, trigger, approval,
 * and analytics services.
 * ============================================================================
 */

import {
  workflowDefinitionService,
  WorkflowDefinitionService,
  workflowExecutionService,
  WorkflowExecutionService,
  workflowTriggerService,
  WorkflowTriggerService,
  workflowApprovalService,
  WorkflowApprovalService,
  workflowAnalyticsService,
  WorkflowAnalyticsService,
  WorkflowPolicy,
  workflowPolicy,
} from "./workflow";

export class WorkflowService {
  constructor(
    public readonly workflow: WorkflowDefinitionService = workflowDefinitionService,
    public readonly execution: WorkflowExecutionService = workflowExecutionService,
    public readonly trigger: WorkflowTriggerService = workflowTriggerService,
    public readonly approval: WorkflowApprovalService = workflowApprovalService,
    public readonly analytics: WorkflowAnalyticsService = workflowAnalyticsService,
    public readonly policy: WorkflowPolicy = workflowPolicy
  ) {}
}

export const workflowService = new WorkflowService();

export {
  workflowDefinitionService,
  workflowExecutionService,
  workflowTriggerService,
  workflowApprovalService,
  workflowAnalyticsService,
  workflowPolicy,
};

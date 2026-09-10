/**
 * ============================================================================
 * Atlas Commerce OS — Workflow Analytics Service
 * ============================================================================
 * Specification Reference: M11-002 / BSD-010 / SAD-001
 * Domain: Workflow Business Intelligence & Operational Metrics Service
 * 
 * Responsibilities:
 * - Aggregate tenant-isolated workflow metrics
 * - Compute execution status volumes, success/failure rates, and retry counts
 * - Calculate step execution durations and performance breakdowns
 * - Breakdown volumes by workflowType and triggerType
 * ============================================================================
 */

import { workflowRepository, WorkflowRepository } from "../../repositories/workflow.repository";
import {
  workflowExecutionRepository,
  WorkflowExecutionRepository,
} from "../../repositories/workflow-execution.repository";

export class WorkflowAnalyticsService {
  constructor(
    private readonly workflowRepo: WorkflowRepository = workflowRepository,
    private readonly executionRepo: WorkflowExecutionRepository = workflowExecutionRepository
  ) {}

  /**
   * Compute comprehensive workflow analytics and operational KPIs for a tenant.
   */
  async getWorkflowAnalytics(companyId: string) {
    if (!companyId) throw new Error("Tenant companyId is required");

    const [workflowsResult, executionsResult] = await Promise.all([
      this.workflowRepo.findMany(companyId, { page: 1, limit: 1000 }),
      this.executionRepo.findExecutions(companyId, { page: 1, limit: 1000 }),
    ]);

    const workflows = workflowsResult.items;
    const executions = executionsResult.items;

    const totalWorkflows = workflows.length;
    const activeWorkflows = workflows.filter((w) => w.isActive).length;
    const inactiveWorkflows = totalWorkflows - activeWorkflows;

    const totalExecutions = executions.length;
    let pendingCount = 0;
    let runningCount = 0;
    let completedCount = 0;
    let failedCount = 0;
    let expiredCount = 0;
    let totalRetryCount = 0;

    const durations: number[] = [];
    const byWorkflowType: Record<string, number> = {};
    const byTriggerType: Record<string, number> = {};

    for (const exec of executions) {
      if (exec.status === "PENDING") pendingCount++;
      else if (exec.status === "APPROVED") completedCount++;
      else if (exec.status === "REJECTED") failedCount++;
      else if (exec.status === "EXPIRED") expiredCount++;

      const wfType = exec.definition?.workflowType || "OTHER";
      byWorkflowType[wfType] = (byWorkflowType[wfType] || 0) + 1;

      let triggerJson: Record<string, any> = {};
      try {
        triggerJson = typeof exec.triggerEvent === "string" ? JSON.parse(exec.triggerEvent) : exec.triggerEvent || {};
      } catch {
        triggerJson = {};
      }

      if (triggerJson.event) {
        const evt = triggerJson.event;
        byTriggerType[evt] = (byTriggerType[evt] || 0) + 1;
      }

      if (triggerJson.retryCount) {
        totalRetryCount += triggerJson.retryCount;
      }

      const stepExecutions: any[] = triggerJson.stepExecutions || [];
      const totalDuration = stepExecutions.reduce((sum, step) => sum + (step.durationMs || 0), 0);
      if (totalDuration > 0) {
        durations.push(totalDuration);
      }
    }

    const closedExecutions = completedCount + failedCount + expiredCount;
    const successRate = closedExecutions > 0 ? Number(((completedCount / closedExecutions) * 100).toFixed(1)) : 100.0;
    const failureRate = closedExecutions > 0 ? Number(((failedCount / closedExecutions) * 100).toFixed(1)) : 0.0;

    const avgDurationMs =
      durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

    return {
      summary: {
        totalWorkflows,
        activeWorkflows,
        inactiveWorkflows,
        totalExecutions,
        pendingExecutions: pendingCount,
        runningExecutions: runningCount,
        completedExecutions: completedCount,
        failedExecutions: failedCount,
        expiredExecutions: expiredCount,
        totalRetryCount,
        successRate,
        failureRate,
        avgDurationMs,
      },
      breakdown: {
        byWorkflowType,
        byTriggerType,
      },
    };
  }
}

export const workflowAnalyticsService = new WorkflowAnalyticsService();

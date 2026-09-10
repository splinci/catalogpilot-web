/**
 * ============================================================================
 * Atlas Commerce OS — Workflow Approval Service
 * ============================================================================
 * Specification Reference: M11-002 / BSD-010 / SAD-001
 * Domain: Workflow Human & Automated Approval Decision Service
 * 
 * Responsibilities:
 * - Approve, reject, and expire workflow execution instances
 * - Validate approval eligibility and prevent duplicate decisions
 * - Record approver identity, timestamps, and decision metadata
 * - Multi-tenant security enforcement & AuditService logging
 * ============================================================================
 */

import {
  workflowExecutionRepository,
  WorkflowExecutionRepository,
} from "../../repositories/workflow-execution.repository";
import { auditService, AuditService } from "../audit.service";
import { workflowPolicy, WorkflowPolicy } from "./workflow.policy";
import { AuditAction, WorkflowStatus } from "@prisma/client";

export class WorkflowApprovalService {
  constructor(
    private readonly executionRepo: WorkflowExecutionRepository = workflowExecutionRepository,
    private readonly audit: AuditService = auditService,
    private readonly policy: WorkflowPolicy = workflowPolicy
  ) {}

  /**
   * Validate if a workflow execution is eligible for approval/rejection decision.
   */
  async validateApprovalEligibility(companyId: string, executionId: string, userId?: string) {
    if (!companyId) throw new Error("Tenant companyId is required");
    const execution = await this.executionRepo.findExecutionById(companyId, executionId);
    if (!execution) {
      throw new Error(`Workflow execution ${executionId} not found or access denied`);
    }

    this.policy.validateApprovalEligibility(execution, userId);
    return execution;
  }

  /**
   * Approve a workflow execution instance.
   */
  async approveExecution(companyId: string, executionId: string, userId: string, notes?: string) {
    const execution = await this.validateApprovalEligibility(companyId, executionId, userId);

    const approvalMetadata = {
      decision: "APPROVED",
      decidedBy: userId,
      decidedAt: new Date().toISOString(),
      notes: notes || null,
    };

    const updated = await this.executionRepo.updateExecutionStatus(
      companyId,
      executionId,
      WorkflowStatus.APPROVED,
      { approvalDecision: approvalMetadata }
    );

    await this.audit.log({
      companyId,
      userId,
      action: AuditAction.USER_UPDATED,
      entityName: "WorkflowExecution",
      entityId: executionId,
      details: {
        operation: "APPROVE_WORKFLOW_EXECUTION",
        workflowId: execution.definitionId,
        notes,
      },
    });

    return updated;
  }

  /**
   * Reject a workflow execution instance.
   */
  async rejectExecution(companyId: string, executionId: string, userId: string, reason?: string) {
    const execution = await this.validateApprovalEligibility(companyId, executionId, userId);

    const rejectionMetadata = {
      decision: "REJECTED",
      decidedBy: userId,
      decidedAt: new Date().toISOString(),
      reason: reason || "No reason provided",
    };

    const updated = await this.executionRepo.updateExecutionStatus(
      companyId,
      executionId,
      WorkflowStatus.REJECTED,
      { approvalDecision: rejectionMetadata }
    );

    await this.audit.log({
      companyId,
      userId,
      action: AuditAction.USER_UPDATED,
      entityName: "WorkflowExecution",
      entityId: executionId,
      details: {
        operation: "REJECT_WORKFLOW_EXECUTION",
        workflowId: execution.definitionId,
        reason,
      },
    });

    return updated;
  }

  /**
   * Expire an un-acted pending workflow execution instance.
   */
  async expireExecution(companyId: string, executionId: string, reason?: string) {
    if (!companyId) throw new Error("Tenant companyId is required");

    const execution = await this.executionRepo.findExecutionById(companyId, executionId);
    if (!execution) {
      throw new Error(`Workflow execution ${executionId} not found or access denied`);
    }

    if (execution.status !== WorkflowStatus.PENDING && (execution.status as string) !== "RUNNING") {
      throw new Error(`Cannot expire execution in ${execution.status} status`);
    }

    const expirationMetadata = {
      decision: "EXPIRED",
      expiredAt: new Date().toISOString(),
      reason: reason || "Approval window elapsed",
    };

    const updated = await this.executionRepo.updateExecutionStatus(
      companyId,
      executionId,
      WorkflowStatus.EXPIRED,
      { approvalDecision: expirationMetadata }
    );

    await this.audit.log({
      companyId,
      action: AuditAction.USER_UPDATED,
      entityName: "WorkflowExecution",
      entityId: executionId,
      details: {
        operation: "EXPIRE_WORKFLOW_EXECUTION",
        workflowId: execution.definitionId,
        reason,
      },
    });

    return updated;
  }
}

export const workflowApprovalService = new WorkflowApprovalService();

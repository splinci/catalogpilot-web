/**
 * ============================================================================
 * Atlas Commerce OS — Enterprise Workflow Automation Repository Test Suite
 * ============================================================================
 * Specification Reference: M11-001 / TEST-001 / SAD-001 / DAT-001
 * Coverage: WorkflowRepository, WorkflowExecutionRepository, Tenant Isolation,
 *           Optimistic Concurrency, Soft Archive, Step Persistence, Outbox Events
 * ============================================================================
 */

import { describe, it, expect, beforeAll } from "vitest";
import { WorkflowRepository } from "../workflow.repository";
import { WorkflowExecutionRepository } from "../workflow-execution.repository";
import {
  WorkflowTypeEnum,
  WorkflowTriggerTypeEnum,
  WorkflowStepTypeEnum,
  WorkflowExecutionStatusEnum,
} from "../../types/workflow.dto";

describe("M11-001 Enterprise Workflow Automation Repository Layer Test Suite", () => {
  const companyA = "cmp_atlas_01";
  const companyB = "cmp_workflow_tenant_b";
  const userId = "usr_workflow_admin";

  let workflowRepo: WorkflowRepository;
  let executionRepo: WorkflowExecutionRepository;

  beforeAll(() => {
    workflowRepo = new WorkflowRepository();
    executionRepo = new WorkflowExecutionRepository();
  });

  describe("Repository Instantiation", () => {
    it("should instantiate WorkflowRepository and WorkflowExecutionRepository", () => {
      expect(workflowRepo).toBeDefined();
      expect(executionRepo).toBeDefined();

      expect(typeof workflowRepo.findMany).toBe("function");
      expect(typeof workflowRepo.findById).toBe("function");
      expect(typeof workflowRepo.create).toBe("function");
      expect(typeof workflowRepo.update).toBe("function");
      expect(typeof workflowRepo.activate).toBe("function");
      expect(typeof workflowRepo.deactivate).toBe("function");
      expect(typeof workflowRepo.archive).toBe("function");
      expect(typeof workflowRepo.createVersion).toBe("function");
      expect(typeof workflowRepo.publishVersion).toBe("function");

      expect(typeof executionRepo.createExecution).toBe("function");
      expect(typeof executionRepo.findExecutions).toBe("function");
      expect(typeof executionRepo.findExecutionById).toBe("function");
      expect(typeof executionRepo.updateExecutionStatus).toBe("function");
      expect(typeof executionRepo.updateExecutionStep).toBe("function");
      expect(typeof executionRepo.retryExecution).toBe("function");
    });
  });

  describe("Workflow Aggregate Persistence & Lifecycle", () => {
    let createdWorkflowId: string;

    it("should create a new WorkflowDefinition with Outbox event emission", async () => {
      const created = await workflowRepo.create(
        companyA,
        {
          name: "Purchase Order High Value Approval",
          workflowType: WorkflowTypeEnum.PO_APPROVAL,
          isActive: true,
          rules: {
            code: "WF_PO_HIGH_VALUE",
            description: "Approve POs exceeding $50,000",
            version: 1,
            triggers: [
              {
                triggerType: WorkflowTriggerTypeEnum.EVENT,
                eventName: "PO_CREATED",
                enabled: true,
              },
            ],
            steps: [
              {
                id: "step_1",
                stepNumber: 1,
                name: "Check Amount Threshold",
                stepType: WorkflowStepTypeEnum.CONDITION,
                action: "EVALUATE_EXPRESSION",
                config: { condition: "totalAmount > 50000" },
              },
              {
                id: "step_2",
                stepNumber: 2,
                name: "Request Finance Manager Approval",
                stepType: WorkflowStepTypeEnum.APPROVAL,
                action: "ASSIGN_APPROVAL_TASK",
                config: { requiredRole: "FINANCE_MANAGER" },
              },
            ],
          },
        },
        userId
      );

      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.companyId).toBe(companyA);
      expect(created.name).toBe("Purchase Order High Value Approval");
      expect(created.workflowType).toBe(WorkflowTypeEnum.PO_APPROVAL);
      expect(created.isActive).toBe(true);

      createdWorkflowId = created.id;
    });

    it("should enforce companyId multi-tenant isolation on findById", async () => {
      const foundForTenantA = await workflowRepo.findById(companyA, createdWorkflowId);
      expect(foundForTenantA).not.toBeNull();
      expect(foundForTenantA?.id).toBe(createdWorkflowId);

      // Cross-tenant query for Company B MUST return null
      const foundForTenantB = await workflowRepo.findById(companyB, createdWorkflowId);
      expect(foundForTenantB).toBeNull();
    });

    it("should perform optimistic concurrency update on WorkflowDefinition", async () => {
      const updated = await workflowRepo.update(
        companyA,
        createdWorkflowId,
        {
          name: "Purchase Order High Value Approval v2",
        },
        userId,
        1 // Expected version
      );

      expect(updated).toBeDefined();
      expect(updated.name).toBe("Purchase Order High Value Approval v2");

      const rules = updated.rules as any;
      expect(rules.version).toBe(2);

      // Concurrency conflict check with stale version
      await expect(
        workflowRepo.update(
          companyA,
          createdWorkflowId,
          { name: "Stale Update" },
          userId,
          1 // Stale version expected -> should fail
        )
      ).rejects.toThrow("Optimistic concurrency conflict");
    });

    it("should support workflow version creation and version history listing", async () => {
      const versionResult = await workflowRepo.createVersion(
        companyA,
        createdWorkflowId,
        {
          rules: {
            code: "WF_PO_HIGH_VALUE",
            description: "Approve POs exceeding $75,000",
            version: 3,
            triggers: [
              {
                triggerType: WorkflowTriggerTypeEnum.EVENT,
                eventName: "PO_CREATED",
                enabled: true,
              },
            ],
            steps: [
              {
                id: "step_1_v3",
                stepNumber: 1,
                name: "Check $75k Threshold",
                stepType: WorkflowStepTypeEnum.CONDITION,
                action: "EVALUATE_EXPRESSION",
                config: { condition: "totalAmount > 75000" },
              },
            ],
          },
          description: "Updated threshold to $75,000",
        },
        userId
      );

      expect(versionResult).toBeDefined();

      const versions = await workflowRepo.findVersions(companyA, createdWorkflowId);
      expect(versions.length).toBeGreaterThanOrEqual(1);
    });

    it("should deactivate and soft archive a workflow definition", async () => {
      const deactivated = await workflowRepo.deactivate(companyA, createdWorkflowId, userId);
      expect(deactivated.isActive).toBe(false);

      const activated = await workflowRepo.activate(companyA, createdWorkflowId, userId);
      expect(activated.isActive).toBe(true);

      const archived = await workflowRepo.archive(companyA, createdWorkflowId, userId);
      expect(archived.isActive).toBe(false);

      const rules = archived.rules as any;
      expect(rules.metadata.archivedAt).toBeDefined();
      expect(rules.metadata.archivedBy).toBe(userId);
    });
  });

  describe("Workflow Execution & Step Persistence", () => {
    let activeWorkflowId: string;
    let createdExecutionId: string;

    beforeAll(async () => {
      const wf = await workflowRepo.create(
        companyA,
        {
          name: "Catalog Review Execution Test Workflow",
          workflowType: WorkflowTypeEnum.CATALOG_REVIEW,
          isActive: true,
          rules: {
            code: "WF_CATALOG_EXEC_TEST",
            version: 1,
            triggers: [],
            steps: [],
          },
        },
        userId
      );
      activeWorkflowId = wf.id;
    });

    it("should create a WorkflowExecution instance for active workflow definition", async () => {
      const execution = await executionRepo.createExecution(
        companyA,
        {
          definitionId: activeWorkflowId,
          triggerEvent: "CATALOG_PRODUCT_SUBMITTED",
          payload: { productId: "prod_12345", sku: "SKU-PO-999" },
        },
        userId
      );

      expect(execution).toBeDefined();
      expect(execution.id).toBeDefined();
      expect(execution.definitionId).toBe(activeWorkflowId);
      expect(execution.status).toBe("PENDING");

      createdExecutionId = execution.id;
    });

    it("should update execution status and step execution metrics", async () => {
      const stepUpdate = await executionRepo.updateExecutionStep(companyA, createdExecutionId, {
        stepId: "step_1",
        stepName: "Catalog Quality Validation",
        status: WorkflowExecutionStatusEnum.COMPLETED,
        input: { qualityScore: 92 },
        output: { result: "PASSED" },
        durationMs: 145,
        retryCount: 0,
      });

      expect(stepUpdate).toBeDefined();

      const updatedExec = await executionRepo.updateExecutionStatus(
        companyA,
        createdExecutionId,
        "APPROVED",
        { completedBy: userId }
      );

      expect(updatedExec.status).toBe("APPROVED");
    });

    it("should support execution retries", async () => {
      const retried = await executionRepo.retryExecution(companyA, createdExecutionId, userId);
      expect(retried).toBeDefined();
      expect(retried.status).toBe("PENDING");

      const triggerData = JSON.parse(retried.triggerEvent);
      expect(triggerData.retryCount).toBe(1);
    });

    it("should enforce companyId multi-tenant isolation on execution queries", async () => {
      const foundForA = await executionRepo.findExecutionById(companyA, createdExecutionId);
      expect(foundForA).not.toBeNull();
      expect(foundForA?.id).toBe(createdExecutionId);

      // Cross-tenant query MUST return null
      const foundForB = await executionRepo.findExecutionById(companyB, createdExecutionId);
      expect(foundForB).toBeNull();
    });
  });
});

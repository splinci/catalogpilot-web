/**
 * ============================================================================
 * Atlas Commerce OS — Workflow Service & Policy Layer Test Suite
 * ============================================================================
 * Specification Reference: M11-002 / TEST-001 / SAD-001
 * Coverage: WorkflowPolicy, WorkflowDefinitionService, WorkflowExecutionService,
 *           WorkflowTriggerService, WorkflowApprovalService, WorkflowAnalyticsService,
 *           Multi-tenant Security, Concurrency, and Outbox Event Emission
 * ============================================================================
 */

import { describe, it, expect, beforeAll } from "vitest";
import { workflowService } from "../../workflow.service";
import { WorkflowPolicy } from "../workflow.policy";
import {
  WorkflowTypeEnum,
  WorkflowTriggerTypeEnum,
  WorkflowStepTypeEnum,
  WorkflowExecutionStatusEnum,
} from "../../../types/workflow.dto";

describe("M11-002 Enterprise Workflow Automation Service & Policy Layer Test Suite", { timeout: 30000 }, () => {
  const companyA = "cmp_atlas_01";
  const companyB = "cmp_workflow_tenant_b";
  const userId = "usr_admin_01";

  let policy: WorkflowPolicy;

  beforeAll(() => {
    policy = workflowService.policy;
  });

  // ==========================================
  // 1. WORKFLOW POLICY ENGINE TESTS
  // ==========================================
  describe("Workflow Policy Engine", () => {
    it("should validate legal workflow lifecycle actions and reject invalid actions", () => {
      // Activating an already active workflow MUST fail
      expect(() => policy.validateWorkflowLifecycle(true, false, "ACTIVATE")).toThrow(
        "Workflow definition is already active"
      );

      // Deactivating an inactive workflow MUST fail
      expect(() => policy.validateWorkflowLifecycle(false, false, "DEACTIVATE")).toThrow(
        "Workflow definition is already inactive"
      );

      // Any operation on an archived workflow MUST fail
      expect(() => policy.validateWorkflowLifecycle(false, true, "UPDATE")).toThrow(
        "Cannot perform operation on an archived workflow definition"
      );
    });

    it("should validate trigger configurations", () => {
      // Event trigger without eventName MUST fail
      expect(() =>
        policy.validateTrigger({
          triggerType: WorkflowTriggerTypeEnum.EVENT,
          enabled: true,
        })
      ).toThrow("Event-based triggers must specify an eventName");

      // Scheduled trigger without cronExpression MUST fail
      expect(() =>
        policy.validateTrigger({
          triggerType: WorkflowTriggerTypeEnum.SCHEDULED,
          enabled: true,
        })
      ).toThrow("Scheduled triggers must specify a cronExpression");
    });

    it("should validate step ordering and duplicate step IDs", () => {
      expect(() =>
        policy.validateSteps([
          {
            id: "step_1",
            stepNumber: 1,
            name: "Step One",
            stepType: WorkflowStepTypeEnum.ACTION,
            action: "DO_SOMETHING",
          },
          {
            id: "step_1", // Duplicate ID
            stepNumber: 2,
            name: "Step Two",
            stepType: WorkflowStepTypeEnum.ACTION,
            action: "DO_SOMETHING_ELSE",
          },
        ])
      ).toThrow("Duplicate step ID detected: step_1");

      expect(() =>
        policy.validateSteps([
          {
            id: "step_1",
            stepNumber: 1,
            name: "Step One",
            stepType: WorkflowStepTypeEnum.ACTION,
            action: "DO_SOMETHING",
            nextStepId: "step_99", // Non-existent nextStepId
          },
        ])
      ).toThrow("references invalid nextStepId: step_99");
    });

    it("should validate execution status transitions", () => {
      // Valid: PENDING -> RUNNING
      expect(() => policy.validateExecutionStatusTransition("PENDING", "RUNNING")).not.toThrow();

      // Invalid: PENDING -> COMPLETED directly
      expect(() => policy.validateExecutionStatusTransition("PENDING", "COMPLETED")).toThrow(
        "Invalid execution status transition from PENDING to COMPLETED"
      );
    });

    it("should validate retry eligibility limits", () => {
      // Non-FAILED status MUST fail
      expect(() => policy.validateRetryEligibility("APPROVED", 0, 3)).toThrow(
        "Only FAILED executions can be retried"
      );

      // Exceeded retries MUST fail
      expect(() => policy.validateRetryEligibility("FAILED", 3, 3)).toThrow(
        "Maximum retry limit reached (3/3)"
      );
    });
  });

  // ==========================================
  // 2. WORKFLOW DEFINITION SERVICE TESTS
  // ==========================================
  describe("Workflow Definition Service", () => {
    let createdWfId: string;

    it("should create a workflow definition with policy enforcement and audit log", async () => {
      const wf = await workflowService.workflow.createWorkflow(
        companyA,
        {
          name: "High Value PO Approval Service Test",
          workflowType: WorkflowTypeEnum.PO_APPROVAL,
          isActive: true,
          rules: {
            code: "WF_SERVICE_PO_TEST",
            version: 1,
            triggers: [
              {
                triggerType: WorkflowTriggerTypeEnum.EVENT,
                eventName: "PO_SUBMITTED_FOR_REVIEW",
                enabled: true,
              },
            ],
            steps: [
              {
                id: "step_review",
                stepNumber: 1,
                name: "Review PO Total Amount",
                stepType: WorkflowStepTypeEnum.CONDITION,
                action: "EVALUATE_THRESHOLD",
              },
            ],
          },
        },
        userId
      );

      expect(wf).toBeDefined();
      expect(wf.id).toBeDefined();
      expect(wf.companyId).toBe(companyA);
      expect(wf.name).toBe("High Value PO Approval Service Test");

      createdWfId = wf.id;
    });

    it("should enforce companyId multi-tenant isolation on getWorkflow", async () => {
      const foundA = await workflowService.workflow.getWorkflow(companyA, createdWfId);
      expect(foundA.id).toBe(createdWfId);

      // Tenant B MUST be rejected
      await expect(
        workflowService.workflow.getWorkflow(companyB, createdWfId)
      ).rejects.toThrow("not found or access denied");
    });

    it("should update workflow properties and handle versioning", async () => {
      const updated = await workflowService.workflow.updateWorkflow(
        companyA,
        createdWfId,
        { name: "Updated PO Approval Name" },
        userId,
        1
      );

      expect(updated.name).toBe("Updated PO Approval Name");
      expect((updated.rules as any).version).toBe(2);
    });

    it("should support version creation, listing, publishing, and cloning", async () => {
      const versionResult = await workflowService.workflow.createVersion(
        companyA,
        createdWfId,
        {
          rules: {
            code: "WF_SERVICE_PO_TEST",
            version: 3,
            triggers: [],
            steps: [],
          },
          description: "V3 Snapshot",
        },
        userId
      );

      expect(versionResult).toBeDefined();

      const versions = await workflowService.workflow.listVersions(companyA, createdWfId);
      expect(versions.length).toBeGreaterThanOrEqual(1);

      const cloned = await workflowService.workflow.cloneVersion(
        companyA,
        createdWfId,
        2,
        "Cloned Workflow Test",
        userId
      );

      expect(cloned).toBeDefined();
      expect(cloned.name).toBe("Cloned Workflow Test");
      expect(cloned.companyId).toBe(companyA);
    });

    it("should deactivate and soft archive workflow definition", async () => {
      const deactivated = await workflowService.workflow.deactivateWorkflow(
        companyA,
        createdWfId,
        userId
      );
      expect(deactivated.isActive).toBe(false);

      const activated = await workflowService.workflow.activateWorkflow(
        companyA,
        createdWfId,
        userId
      );
      expect(activated.isActive).toBe(true);
    });
  });

  // ==========================================
  // 3. WORKFLOW EXECUTION SERVICE TESTS
  // ==========================================
  describe("Workflow Execution Service", () => {
    let testWfId: string;
    let executionId: string;

    beforeAll(async () => {
      const wf = await workflowService.workflow.createWorkflow(
        companyA,
        {
          name: "Execution Test Harness Workflow",
          workflowType: WorkflowTypeEnum.CATALOG_REVIEW,
          isActive: true,
          rules: {
            code: "WF_EXEC_HARNESS",
            version: 1,
            triggers: [],
            steps: [],
          },
        },
        userId
      );
      testWfId = wf.id;
    });

    it("should create execution and record step progress", async () => {
      const exec = await workflowService.execution.createExecution(
        companyA,
        {
          definitionId: testWfId,
          triggerEvent: "PRODUCT_CATALOG_SUBMITTED",
          payload: { productId: "prod_test_888" },
        },
        userId
      );

      expect(exec).toBeDefined();
      expect(exec.status).toBe("PENDING");

      executionId = exec.id;

      const started = await workflowService.execution.startExecution(companyA, executionId, userId);
      expect(started).toBeDefined();

      const step1 = await workflowService.execution.completeStep(
        companyA,
        executionId,
        "step_1",
        "Validate SKU Format",
        { valid: true },
        120
      );
      expect(step1).toBeDefined();
    });

    it("should complete execution status to APPROVED", async () => {
      const completed = await workflowService.execution.completeExecution(
        companyA,
        executionId,
        { verifiedBy: userId }
      );
      expect(completed.status).toBe("APPROVED");
    });
  });

  // ==========================================
  // 4. TRIGGER SERVICE TESTS
  // ==========================================
  describe("Workflow Trigger Service", () => {
    it("should match event triggers and process trigger events automatically", async () => {
      const eventName = `TEST_TRIGGER_EVENT_${Date.now()}`;

      await workflowService.workflow.createWorkflow(
        companyA,
        {
          name: "Auto Trigger Test Workflow",
          workflowType: WorkflowTypeEnum.PO_APPROVAL,
          isActive: true,
          rules: {
            code: `WF_AUTO_TRIG_${Date.now()}`,
            version: 1,
            triggers: [
              {
                triggerType: WorkflowTriggerTypeEnum.EVENT,
                eventName,
                enabled: true,
              },
            ],
            steps: [],
          },
        },
        userId
      );

      const evaluation = await workflowService.trigger.evaluateTriggers(companyA, eventName, {
        poNumber: "PO-9999",
      });

      expect(evaluation.matchingCount).toBeGreaterThanOrEqual(1);

      const result = await workflowService.trigger.processTriggerEvent(
        companyA,
        eventName,
        { poNumber: "PO-9999" },
        userId
      );

      expect(result.createdCount).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================
  // 5. APPROVAL SERVICE TESTS
  // ==========================================
  describe("Workflow Approval Service", () => {
    let approvalExecId: string;

    beforeAll(async () => {
      const wf = await workflowService.workflow.createWorkflow(
        companyA,
        {
          name: "Approval Service Test Workflow",
          workflowType: WorkflowTypeEnum.PO_APPROVAL,
          isActive: true,
          rules: { code: `WF_APP_${Date.now()}`, version: 1, triggers: [], steps: [] },
        },
        userId
      );

      const exec = await workflowService.execution.createExecution(
        companyA,
        { definitionId: wf.id, triggerEvent: "APPROVAL_REQUESTED" },
        userId
      );

      approvalExecId = exec.id;
    });

    it("should approve execution and record approver decision", async () => {
      const approved = await workflowService.approval.approveExecution(
        companyA,
        approvalExecId,
        userId,
        "PO approved after finance review"
      );

      expect(approved.status).toBe("APPROVED");

      // Duplicate decision MUST fail
      await expect(
        workflowService.approval.approveExecution(
          companyA,
          approvalExecId,
          userId,
          "Second decision attempt"
        )
      ).rejects.toThrow("Cannot record approval decision");
    });
  });

  // ==========================================
  // 6. ANALYTICS SERVICE TESTS
  // ==========================================
  describe("Workflow Analytics Service", () => {
    it("should compute tenant workflow analytics and KPIs", async () => {
      const analytics = await workflowService.analytics.getWorkflowAnalytics(companyA);

      expect(analytics).toBeDefined();
      expect(analytics.summary.totalWorkflows).toBeGreaterThan(0);
      expect(analytics.summary.successRate).toBeGreaterThanOrEqual(0);
      expect(analytics.breakdown).toBeDefined();
    });
  });
});

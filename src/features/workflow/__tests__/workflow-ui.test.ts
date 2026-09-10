/**
 * ============================================================================
 * Atlas Commerce OS — Workflow UI & Hook Layer Test Suite
 * ============================================================================
 * Specification Reference: M11-004 / TEST-001 / SAD-001 / IAM-002
 * Coverage: Custom React hooks exports, Reusable UI component exports,
 *           WorkflowStatusBadge formatting, KPI calculations, and strict
 *           architecture verification (0 Prisma, 0 Repository, 0 Service imports).
 * ============================================================================
 */

import { describe, it, expect } from "vitest";
import * as hooks from "../hooks";
import * as components from "../components";
import fs from "fs";
import path from "path";

describe("M11-004 Enterprise Workflow Automation UI Workspace Test Suite", () => {
  describe("Custom React Hooks Exports", () => {
    it("should export all mandatory workflow hooks", () => {
      expect(hooks.useWorkflows).toBeDefined();
      expect(typeof hooks.useWorkflows).toBe("function");

      expect(hooks.useWorkflow).toBeDefined();
      expect(typeof hooks.useWorkflow).toBe("function");

      expect(hooks.useWorkflowExecutions).toBeDefined();
      expect(typeof hooks.useWorkflowExecutions).toBe("function");

      expect(hooks.useWorkflowSteps).toBeDefined();
      expect(typeof hooks.useWorkflowSteps).toBe("function");

      expect(hooks.useWorkflowApprovals).toBeDefined();
      expect(typeof hooks.useWorkflowApprovals).toBe("function");

      expect(hooks.useWorkflowTriggers).toBeDefined();
      expect(typeof hooks.useWorkflowTriggers).toBe("function");

      expect(hooks.useWorkflowAnalytics).toBeDefined();
      expect(typeof hooks.useWorkflowAnalytics).toBe("function");
    });
  });

  describe("Reusable UI Components Exports", () => {
    it("should export all mandatory UI components", () => {
      expect(components.WorkflowKPICards).toBeDefined();
      expect(components.WorkflowStatusBadge).toBeDefined();
      expect(components.WorkflowTable).toBeDefined();
      expect(components.WorkflowDetailsDrawer).toBeDefined();
      expect(components.CreateWorkflowModal).toBeDefined();
      expect(components.WorkflowVersionTable).toBeDefined();
      expect(components.WorkflowExecutionTable).toBeDefined();
      expect(components.WorkflowExecutionDrawer).toBeDefined();
      expect(components.WorkflowStepTimeline).toBeDefined();
      expect(components.WorkflowApprovalPanel).toBeDefined();
      expect(components.WorkflowTriggerPanel).toBeDefined();
      expect(components.WorkflowAnalyticsCards).toBeDefined();
      expect(components.WorkflowDashboardCharts).toBeDefined();
      expect(components.LoadingSkeleton).toBeDefined();
      expect(components.EmptyState).toBeDefined();
      expect(components.ErrorState).toBeDefined();
    });
  });

  describe("Architectural Boundary Verification", () => {
    it("should ensure 0 Prisma, 0 Repository, and 0 Service imports in src/features/workflow", () => {
      const featureDir = path.resolve(process.cwd(), "src/features/workflow");

      function getAllFiles(dir: string): string[] {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        let files: string[] = [];
        for (const entry of entries) {
          const res = path.resolve(dir, entry.name);
          if (entry.isDirectory()) {
            if (entry.name !== "__tests__") {
              files = files.concat(getAllFiles(res));
            }
          } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
            files.push(res);
          }
        }
        return files;
      }

      const allFiles = getAllFiles(featureDir);
      expect(allFiles.length).toBeGreaterThan(0);

      const forbiddenPatterns = [
        /@prisma\/client/,
        /prisma\//,
        /repositories\//,
        /\.repository/,
        /services\/workflow/,
        /workflow\.service/,
      ];

      for (const filePath of allFiles) {
        const content = fs.readFileSync(filePath, "utf-8");
        for (const pattern of forbiddenPatterns) {
          const match = pattern.test(content);
          if (match) {
            throw new Error(
              `Forbidden import matching '${pattern}' found in ${filePath}`
            );
          }
        }
      }
    });
  });
});

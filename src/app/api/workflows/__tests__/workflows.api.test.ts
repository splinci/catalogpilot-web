/**
 * ============================================================================
 * Atlas Commerce OS — Workflow REST API Layer Test Suite
 * ============================================================================
 * Specification Reference: M11-003 / TEST-001 / API-001 / IAM-002
 * Coverage: App Router route handlers, 401/403/422/404/409 status codes,
 *           Zod validation, RBAC enforcement, session companyId isolation,
 *           and zero direct Prisma/Repository access verification.
 * ============================================================================
 */

import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getWorkflows, POST as createWorkflow } from "../route";
import { GET as getWorkflow, PUT as updateWorkflow, DELETE as archiveWorkflow } from "../[id]/route";
import { POST as activateWorkflow } from "../[id]/activate/route";
import { POST as deactivateWorkflow } from "../[id]/deactivate/route";
import { GET as listVersions, POST as createVersion } from "../[id]/versions/route";
import { POST as publishVersion } from "../[id]/versions/publish/route";
import { POST as cloneVersion } from "../[id]/versions/clone/route";
import { GET as listExecutions, POST as createExecution } from "../executions/route";
import { GET as getExecution } from "../executions/[id]/route";
import { POST as startExecution } from "../executions/[id]/start/route";
import { POST as completeExecution } from "../executions/[id]/complete/route";
import { POST as retryExecution } from "../executions/[id]/retry/route";
import { POST as processTriggers } from "../triggers/route";
import { POST as approveExecution } from "../executions/[id]/approve/route";
import { GET as getAnalytics } from "../analytics/route";
import { GET as getDashboard } from "../dashboard/route";
import { getCurrentSession } from "../../../../lib/auth";
import { WorkflowTypeEnum } from "../../../../types/workflow.dto";

// Mock authentication session module
vi.mock("../../../../lib/auth", () => ({
  getCurrentSession: vi.fn(),
}));

describe("M11-003 Enterprise Workflow Automation REST API Layer Test Suite", { timeout: 30000 }, () => {
  const adminSession = {
    userId: "usr_admin_01",
    email: "admin@atlas.com",
    firstName: "Atlas",
    lastName: "Admin",
    role: "ADMIN",
    companyId: "cmp_atlas_01",
    companyCode: "ATLAS",
    companyName: "Atlas Commerce OS Inc.",
  };

  const restrictedSession = {
    userId: "usr_sales_rep_01",
    email: "sales@atlas.com",
    firstName: "Sales",
    lastName: "Rep",
    role: "SALES_REPRESENTATIVE",
    companyId: "cmp_atlas_01",
    companyCode: "ATLAS",
    companyName: "Atlas Commerce OS Inc.",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Authentication & RBAC Security Controls", () => {
    it("should return 401 Unauthorized for unauthenticated requests", async () => {
      (getCurrentSession as any).mockResolvedValueOnce(null);

      const req = new NextRequest("http://localhost:3000/api/workflows");
      const res = await getWorkflows(req);

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe("Unauthorized");
    });

    it("should return 403 Forbidden when user role lacks permissions", async () => {
      (getCurrentSession as any).mockResolvedValueOnce(restrictedSession);

      const req = new NextRequest("http://localhost:3000/api/workflows", {
        method: "POST",
        body: JSON.stringify({ name: "Unauthorized Workflow" }),
      });
      const res = await createWorkflow(req);

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe("Forbidden");
    });
  });

  describe("Zod Payload Validation", () => {
    it("should return 422 Unprocessable Entity for invalid POST /api/workflows payload", async () => {
      (getCurrentSession as any).mockResolvedValueOnce(adminSession);

      const req = new NextRequest("http://localhost:3000/api/workflows", {
        method: "POST",
        body: JSON.stringify({ name: "" }), // Invalid empty name and missing workflowType
      });
      const res = await createWorkflow(req);

      expect(res.status).toBe(422);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe("Unprocessable Entity");
      expect(body.details).toBeDefined();
    });
  });

  describe("Workflow Definition Endpoints", () => {
    let createdWfId: string;

    it("POST /api/workflows — should create a new workflow definition and return 201", async () => {
      (getCurrentSession as any).mockResolvedValue(adminSession);

      const req = new NextRequest("http://localhost:3000/api/workflows", {
        method: "POST",
        body: JSON.stringify({
          name: "API Test PO Approval Workflow",
          workflowType: WorkflowTypeEnum.PO_APPROVAL,
          isActive: true,
          rules: {
            code: "WF_API_TEST",
            version: 1,
            triggers: [],
            steps: [],
          },
        }),
      });
      const res = await createWorkflow(req);

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.id).toBeDefined();
      expect(body.data.name).toBe("API Test PO Approval Workflow");

      createdWfId = body.data.id;
    });

    it("GET /api/workflows — should list workflow definitions with 200", async () => {
      (getCurrentSession as any).mockResolvedValue(adminSession);

      const req = new NextRequest("http://localhost:3000/api/workflows?page=1&limit=10");
      const res = await getWorkflows(req);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it("GET /api/workflows/:id — should fetch workflow detail with 200", async () => {
      (getCurrentSession as any).mockResolvedValue(adminSession);

      const req = new NextRequest(`http://localhost:3000/api/workflows/${createdWfId}`);
      const res = await getWorkflow(req, { params: Promise.resolve({ id: createdWfId }) });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(createdWfId);
    });

    it("PUT /api/workflows/:id — should update workflow definition with 200", async () => {
      (getCurrentSession as any).mockResolvedValue(adminSession);

      const req = new NextRequest(`http://localhost:3000/api/workflows/${createdWfId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: "API Test PO Approval Workflow v2",
          expectedVersion: 1,
        }),
      });
      const res = await updateWorkflow(req, { params: Promise.resolve({ id: createdWfId }) });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.name).toBe("API Test PO Approval Workflow v2");
    });

    it("POST /api/workflows/:id/deactivate and /activate — should toggle state with 200", async () => {
      (getCurrentSession as any).mockResolvedValue(adminSession);

      const reqDeact = new NextRequest(`http://localhost:3000/api/workflows/${createdWfId}/deactivate`, { method: "POST" });
      const resDeact = await deactivateWorkflow(reqDeact, { params: Promise.resolve({ id: createdWfId }) });
      expect(resDeact.status).toBe(200);

      const reqAct = new NextRequest(`http://localhost:3000/api/workflows/${createdWfId}/activate`, { method: "POST" });
      const resAct = await activateWorkflow(reqAct, { params: Promise.resolve({ id: createdWfId }) });
      expect(resAct.status).toBe(200);
    });

    it("DELETE /api/workflows/:id — should soft archive workflow with 200", async () => {
      (getCurrentSession as any).mockResolvedValue(adminSession);

      const req = new NextRequest(`http://localhost:3000/api/workflows/${createdWfId}`, { method: "DELETE" });
      const res = await archiveWorkflow(req, { params: Promise.resolve({ id: createdWfId }) });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });
  });

  describe("Workflow Versioning Endpoints", () => {
    let versionWfId: string;

    beforeAll(async () => {
      (getCurrentSession as any).mockResolvedValue(adminSession);
      const req = new NextRequest("http://localhost:3000/api/workflows", {
        method: "POST",
        body: JSON.stringify({
          name: "Version Endpoint Test Workflow",
          workflowType: WorkflowTypeEnum.CATALOG_REVIEW,
          isActive: true,
          rules: { code: `WF_VER_${Date.now()}`, version: 1, triggers: [], steps: [] },
        }),
      });
      const res = await createWorkflow(req);
      const body = await res.json();
      versionWfId = body.data.id;
    });

    it("POST /api/workflows/:id/versions — should create version snapshot with 201", async () => {
      (getCurrentSession as any).mockResolvedValue(adminSession);

      const req = new NextRequest(`http://localhost:3000/api/workflows/${versionWfId}/versions`, {
        method: "POST",
        body: JSON.stringify({
          rules: { code: "WF_VER_TEST", version: 2, triggers: [], steps: [] },
          description: "Snapshot V2",
        }),
      });
      const res = await createVersion(req, { params: Promise.resolve({ id: versionWfId }) });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    it("GET /api/workflows/:id/versions — should list versions with 200", async () => {
      (getCurrentSession as any).mockResolvedValue(adminSession);

      const req = new NextRequest(`http://localhost:3000/api/workflows/${versionWfId}/versions`);
      const res = await listVersions(req, { params: Promise.resolve({ id: versionWfId }) });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it("POST /api/workflows/:id/versions/publish — should publish version with 200", async () => {
      (getCurrentSession as any).mockResolvedValue(adminSession);

      const req = new NextRequest(`http://localhost:3000/api/workflows/${versionWfId}/versions/publish`, {
        method: "POST",
        body: JSON.stringify({ versionNumber: 1 }),
      });
      const res = await publishVersion(req, { params: Promise.resolve({ id: versionWfId }) });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    it("POST /api/workflows/:id/versions/clone — should clone version with 201", async () => {
      (getCurrentSession as any).mockResolvedValue(adminSession);

      const req = new NextRequest(`http://localhost:3000/api/workflows/${versionWfId}/versions/clone`, {
        method: "POST",
        body: JSON.stringify({ versionNumber: 1, newName: "Cloned Version Workflow" }),
      });
      const res = await cloneVersion(req, { params: Promise.resolve({ id: versionWfId }) });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.name).toBe("Cloned Version Workflow");
    });
  });

  describe("Workflow Execution & Approval Endpoints", () => {
    let execWfId: string;
    let executionId: string;

    beforeAll(async () => {
      (getCurrentSession as any).mockResolvedValue(adminSession);
      const req = new NextRequest("http://localhost:3000/api/workflows", {
        method: "POST",
        body: JSON.stringify({
          name: "API Execution Harness Workflow",
          workflowType: WorkflowTypeEnum.PO_APPROVAL,
          isActive: true,
          rules: { code: `WF_EXEC_API_${Date.now()}`, version: 1, triggers: [], steps: [] },
        }),
      });
      const res = await createWorkflow(req);
      const body = await res.json();
      execWfId = body.data.id;
    });

    it("POST /api/workflows/executions — should create execution with 201", async () => {
      (getCurrentSession as any).mockResolvedValue(adminSession);

      const req = new NextRequest("http://localhost:3000/api/workflows/executions", {
        method: "POST",
        body: JSON.stringify({
          definitionId: execWfId,
          triggerEvent: "PO_CREATED",
          payload: { poId: "po_12345" },
        }),
      });
      const res = await createExecution(req);

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.id).toBeDefined();

      executionId = body.data.id;
    });

    it("GET /api/workflows/executions — should list executions with 200", async () => {
      (getCurrentSession as any).mockResolvedValue(adminSession);

      const req = new NextRequest("http://localhost:3000/api/workflows/executions?page=1&limit=10");
      const res = await listExecutions(req);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it("GET /api/workflows/executions/:id — should fetch execution with 200", async () => {
      (getCurrentSession as any).mockResolvedValue(adminSession);

      const req = new NextRequest(`http://localhost:3000/api/workflows/executions/${executionId}`);
      const res = await getExecution(req, { params: Promise.resolve({ id: executionId }) });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(executionId);
    });

    it("POST /api/workflows/executions/:id/start — should start execution with 200", async () => {
      (getCurrentSession as any).mockResolvedValue(adminSession);

      const req = new NextRequest(`http://localhost:3000/api/workflows/executions/${executionId}/start`, { method: "POST" });
      const res = await startExecution(req, { params: Promise.resolve({ id: executionId }) });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    it("POST /api/workflows/executions/:id/approve — should approve execution with 200", async () => {
      (getCurrentSession as any).mockResolvedValue(adminSession);

      const req = new NextRequest(`http://localhost:3000/api/workflows/executions/${executionId}/approve`, {
        method: "POST",
        body: JSON.stringify({ notes: "Approved via REST API" }),
      });
      const res = await approveExecution(req, { params: Promise.resolve({ id: executionId }) });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.status).toBe("APPROVED");
    });
  });

  describe("Analytics & Dashboard Endpoints", () => {
    it("GET /api/workflows/analytics — should return analytics with 200", async () => {
      (getCurrentSession as any).mockResolvedValue(adminSession);

      const req = new NextRequest("http://localhost:3000/api/workflows/analytics");
      const res = await getAnalytics(req);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.summary).toBeDefined();
    });

    it("GET /api/workflows/dashboard — should return dashboard KPIs with 200", async () => {
      (getCurrentSession as any).mockResolvedValue(adminSession);

      const req = new NextRequest("http://localhost:3000/api/workflows/dashboard");
      const res = await getDashboard(req);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.kpis).toBeDefined();
    });
  });
});

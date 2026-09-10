/**
 * ============================================================================
 * Splinci Commerce OS — Operations REST API Test Suite
 * ============================================================================
 * Specification Reference: M12-003 / TEST-001 / API-001 / IAM-002 / SEC-001
 * Coverage: Operations App Router APIs, Authentication, RBAC Permissions,
 *           Validation Envelopes, Tenant Isolation & Static Architecture
 * ============================================================================
 */

import { describe, it, expect, vi, beforeAll } from "vitest";
import { NextRequest } from "next/server";

import { GET as getHealth } from "../health/route";
import { GET as getHealthHistory } from "../health/history/route";
import { POST as triggerHealthCheck } from "../health/check/route";
import { GET as getTelemetry } from "../telemetry/route";
import { GET as getReadiness } from "../readiness/route";
import { GET as getIncidents } from "../incidents/route";
import { GET as getIncidentSummary } from "../incidents/summary/route";
import { GET as getCriticalIncidents } from "../incidents/critical/route";
import { GET as getMetrics } from "../metrics/route";
import { GET as getOperationalKPIs } from "../metrics/operational/route";
import { GET as getQueueMetrics } from "../metrics/queue/route";
import { GET as getOutbox } from "../outbox/route";
import { GET as getOutboxHealth } from "../outbox/health/route";
import { GET as getSettings, PUT as upsertSetting } from "../settings/route";
import { GET as getNotifications, POST as createNotification } from "../notifications/route";
import { GET as getUnreadCount } from "../notifications/unread-count/route";
import { GET as getDashboard } from "../dashboard/route";
import { GET as getAnalytics } from "../analytics/route";

import * as authModule from "../../../../lib/auth";
import { authorizationService } from "../../../../services/authorization.service";
import fs from "fs";
import path from "path";

import { prisma } from "../../../../lib/prisma";

describe("M12-003 Enterprise Operations REST API Test Suite", () => {
  const mockAdminSession = {
    userId: "usr_api_admin",
    companyId: "cmp_api_tenant_a",
    email: "admin@tenanta.com",
    role: "ADMIN" as const,
  };

  const mockUnauthorizedSession = {
    userId: "usr_api_sales",
    companyId: "cmp_api_tenant_a",
    email: "sales@tenanta.com",
    role: "SALES_REPRESENTATIVE" as const,
  };

  beforeAll(async () => {
    vi.restoreAllMocks();

    await prisma.company.upsert({
      where: { id: mockAdminSession.companyId },
      create: {
        id: mockAdminSession.companyId,
        code: "OPS_API_A",
        legalName: "Ops API Tenant A Legal",
        displayName: "Ops API Tenant A",
      },
      update: {},
    });

    await prisma.user.upsert({
      where: { id: mockAdminSession.userId },
      create: {
        id: mockAdminSession.userId,
        companyId: mockAdminSession.companyId,
        email: mockAdminSession.email,
        passwordHash: "hashed",
        firstName: "API",
        lastName: "Admin",
      },
      update: {},
    });
  });

  describe("1. Authentication & RBAC Authorization Checks", () => {
    it("should return HTTP 401 Unauthorized when no session exists", async () => {
      vi.spyOn(authModule, "getCurrentSession").mockResolvedValueOnce(null);

      const req = new NextRequest("http://localhost/api/operations/health");
      const res = await getHealth(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error).toBe("Unauthorized");
    });

    it("should return HTTP 403 Forbidden when user lacks required permission", async () => {
      vi.spyOn(authModule, "getCurrentSession").mockResolvedValueOnce(mockUnauthorizedSession);
      vi.spyOn(authorizationService, "hasPermission").mockReturnValueOnce(false);

      const req = new NextRequest("http://localhost/api/operations/health/check", { method: "POST" });
      const res = await triggerHealthCheck(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.success).toBe(false);
      expect(json.error).toBe("Forbidden");
    });
  });

  describe("2. Health & Telemetry APIs", () => {
    it("should execute GET /api/operations/health cleanly", async () => {
      vi.spyOn(authModule, "getCurrentSession").mockResolvedValue(mockAdminSession);

      const req = new NextRequest("http://localhost/api/operations/health");
      const res = await getHealth(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.status).toBeDefined();
      expect(json.data.database.connected).toBe(true);
    });

    it("should execute GET /api/operations/health/history", async () => {
      vi.spyOn(authModule, "getCurrentSession").mockResolvedValue(mockAdminSession);

      const req = new NextRequest("http://localhost/api/operations/health/history?limit=5");
      const res = await getHealthHistory(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });

    it("should execute POST /api/operations/health/check", async () => {
      vi.spyOn(authModule, "getCurrentSession").mockResolvedValue(mockAdminSession);

      const req = new NextRequest("http://localhost/api/operations/health/check", { method: "POST" });
      const res = await triggerHealthCheck(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.id).toBeDefined();
    });

    it("should execute GET /api/operations/telemetry", async () => {
      vi.spyOn(authModule, "getCurrentSession").mockResolvedValue(mockAdminSession);

      const req = new NextRequest("http://localhost/api/operations/telemetry");
      const res = await getTelemetry(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.system.nodeVersion).toBeDefined();
    });

    it("should execute GET /api/operations/readiness", async () => {
      vi.spyOn(authModule, "getCurrentSession").mockResolvedValue(mockAdminSession);

      const req = new NextRequest("http://localhost/api/operations/readiness");
      const res = await getReadiness(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(typeof json.data.score).toBe("number");
    });
  });

  describe("3. Incident APIs", () => {
    it("should execute GET /api/operations/incidents", async () => {
      vi.spyOn(authModule, "getCurrentSession").mockResolvedValue(mockAdminSession);

      const req = new NextRequest("http://localhost/api/operations/incidents?page=1&limit=10");
      const res = await getIncidents(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data.incidents)).toBe(true);
    });

    it("should execute GET /api/operations/incidents/summary", async () => {
      vi.spyOn(authModule, "getCurrentSession").mockResolvedValue(mockAdminSession);

      const req = new NextRequest("http://localhost/api/operations/incidents/summary");
      const res = await getIncidentSummary(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.companyId).toBe(mockAdminSession.companyId);
    });

    it("should execute GET /api/operations/incidents/critical", async () => {
      vi.spyOn(authModule, "getCurrentSession").mockResolvedValue(mockAdminSession);

      const req = new NextRequest("http://localhost/api/operations/incidents/critical");
      const res = await getCriticalIncidents(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });
  });

  describe("4. Operations Metrics APIs", () => {
    it("should execute GET /api/operations/metrics", async () => {
      vi.spyOn(authModule, "getCurrentSession").mockResolvedValue(mockAdminSession);

      const req = new NextRequest("http://localhost/api/operations/metrics");
      const res = await getMetrics(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.companyId).toBe(mockAdminSession.companyId);
    });

    it("should execute GET /api/operations/metrics/operational", async () => {
      vi.spyOn(authModule, "getCurrentSession").mockResolvedValue(mockAdminSession);

      const req = new NextRequest("http://localhost/api/operations/metrics/operational");
      const res = await getOperationalKPIs(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(typeof json.data.queueSuccessRate).toBe("number");
    });

    it("should execute GET /api/operations/metrics/queue", async () => {
      vi.spyOn(authModule, "getCurrentSession").mockResolvedValue(mockAdminSession);

      const req = new NextRequest("http://localhost/api/operations/metrics/queue");
      const res = await getQueueMetrics(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(typeof json.data.totalMessages).toBe("number");
    });
  });

  describe("5. Outbox APIs", () => {
    it("should execute GET /api/operations/outbox", async () => {
      vi.spyOn(authModule, "getCurrentSession").mockResolvedValue(mockAdminSession);

      const req = new NextRequest("http://localhost/api/operations/outbox?page=1&limit=10");
      const res = await getOutbox(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data.messages)).toBe(true);
    });

    it("should execute GET /api/operations/outbox/health", async () => {
      vi.spyOn(authModule, "getCurrentSession").mockResolvedValue(mockAdminSession);

      const req = new NextRequest("http://localhost/api/operations/outbox/health");
      const res = await getOutboxHealth(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(typeof json.data.isHealthy).toBe("boolean");
    });
  });

  describe("6. System Settings APIs", () => {
    it("should execute GET /api/operations/settings", async () => {
      vi.spyOn(authModule, "getCurrentSession").mockResolvedValue(mockAdminSession);

      const req = new NextRequest("http://localhost/api/operations/settings");
      const res = await getSettings(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });

    it("should validate PUT /api/operations/settings and return HTTP 422 for invalid setting key format", async () => {
      vi.spyOn(authModule, "getCurrentSession").mockResolvedValue(mockAdminSession);

      const req = new NextRequest("http://localhost/api/operations/settings", {
        method: "PUT",
        body: JSON.stringify({ key: "invalid key format", value: "value" }),
      });
      const res = await upsertSetting(req);
      const json = await res.json();

      expect(res.status).toBe(422);
      expect(json.success).toBe(false);
    });

    it("should execute PUT /api/operations/settings successfully for valid setting key", async () => {
      vi.spyOn(authModule, "getCurrentSession").mockResolvedValue(mockAdminSession);

      const req = new NextRequest("http://localhost/api/operations/settings", {
        method: "PUT",
        body: JSON.stringify({ key: "API_RATE_LIMIT_PER_MINUTE", value: "600" }),
      });
      const res = await upsertSetting(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.key).toBe("API_RATE_LIMIT_PER_MINUTE");
    });
  });

  describe("7. Notification APIs", () => {
    it("should execute GET /api/operations/notifications", async () => {
      vi.spyOn(authModule, "getCurrentSession").mockResolvedValue(mockAdminSession);

      const req = new NextRequest("http://localhost/api/operations/notifications");
      const res = await getNotifications(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });

    it("should execute POST /api/operations/notifications", async () => {
      vi.spyOn(authModule, "getCurrentSession").mockResolvedValue(mockAdminSession);

      const req = new NextRequest("http://localhost/api/operations/notifications", {
        method: "POST",
        body: JSON.stringify({
          title: "System Alert: High Load",
          message: "CPU utilization spiked to 85%",
        }),
      });
      const res = await createNotification(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.title).toBe("System Alert: High Load");
    });

    it("should execute GET /api/operations/notifications/unread-count", async () => {
      vi.spyOn(authModule, "getCurrentSession").mockResolvedValue(mockAdminSession);

      const req = new NextRequest("http://localhost/api/operations/notifications/unread-count");
      const res = await getUnreadCount(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(typeof json.data.unreadCount).toBe("number");
    });
  });

  describe("8. Analytics & Dashboard APIs", () => {
    it("should execute GET /api/operations/dashboard", async () => {
      vi.spyOn(authModule, "getCurrentSession").mockResolvedValue(mockAdminSession);

      const req = new NextRequest("http://localhost/api/operations/dashboard");
      const res = await getDashboard(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.companyId).toBe(mockAdminSession.companyId);
      expect(json.data.readiness).toBeDefined();
      expect(json.data.telemetry).toBeDefined();
    });

    it("should execute GET /api/operations/analytics", async () => {
      vi.spyOn(authModule, "getCurrentSession").mockResolvedValue(mockAdminSession);

      const req = new NextRequest("http://localhost/api/operations/analytics");
      const res = await getAnalytics(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.companyId).toBe(mockAdminSession.companyId);
    });
  });

  describe("9. Static Architectural Verification", () => {
    it("should verify 0 Prisma imports and 0 Repository imports across all M12-003 API routes", () => {
      const opsApiDir = path.join(process.cwd(), "src", "app", "api", "operations");

      function getRouteFiles(dir: string): string[] {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        let files: string[] = [];
        for (const entry of entries) {
          const res = path.resolve(dir, entry.name);
          if (entry.isDirectory()) {
            if (entry.name !== "__tests__") {
              files = files.concat(getRouteFiles(res));
            }
          } else if (entry.isFile() && entry.name.endsWith(".ts")) {
            files.push(res);
          }
        }
        return files;
      }

      const routeFiles = getRouteFiles(opsApiDir);
      expect(routeFiles.length).toBeGreaterThan(15);

      for (const filePath of routeFiles) {
        const content = fs.readFileSync(filePath, "utf-8");
        expect(content).not.toContain("@prisma/client");
        expect(content).not.toContain("repositories/");
        expect(content).toContain("operationsService");
      }
    });
  });
});

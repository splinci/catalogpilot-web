import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../resend/route";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SMTPEmailProvider } from "@/services/providers/email-provider.interface";

vi.mock("@/lib/auth", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    session: {
      findFirst: vi.fn(),
    },
  },
}));

describe("POST /api/admin/invitations/resend", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  it("should return 401 Unauthorized for unauthenticated requests", async () => {
    vi.mocked(getCurrentSession).mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost:3000/api/admin/invitations/resend", {
      method: "POST",
      body: JSON.stringify({ userId: "usr_123" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe("Unauthorized");
  });

  it("should return 403 Forbidden for non-ADMIN users without users:manage permission", async () => {
    vi.mocked(getCurrentSession).mockResolvedValueOnce({
      userId: "usr_sales_1",
      email: "sales@test.com",
      firstName: "Sales",
      lastName: "Rep",
      role: "SALES_REPRESENTATIVE" as any,
      companyId: "cmp_123",
      companyCode: "TEST",
      companyName: "Test Co",
    });

    const req = new NextRequest("http://localhost:3000/api/admin/invitations/resend", {
      method: "POST",
      body: JSON.stringify({ userId: "usr_123" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe("Forbidden");
  });

  it("should return 400 Bad Request when userId parameter is missing", async () => {
    vi.mocked(getCurrentSession).mockResolvedValueOnce({
      userId: "usr_admin_1",
      email: "admin@test.com",
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN" as any,
      companyId: "cmp_123",
      companyCode: "TEST",
      companyName: "Test Co",
    });

    const req = new NextRequest("http://localhost:3000/api/admin/invitations/resend", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Missing required parameter 'userId'");
  });

  it("should return 404 Not Found when target user does not exist", async () => {
    vi.mocked(getCurrentSession).mockResolvedValueOnce({
      userId: "usr_admin_1",
      email: "admin@test.com",
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN" as any,
      companyId: "cmp_123",
      companyCode: "TEST",
      companyName: "Test Co",
    });

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost:3000/api/admin/invitations/resend", {
      method: "POST",
      body: JSON.stringify({ userId: "nonexistent_usr" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toContain("Target user record does not exist");
  });

  it("should return 403 Forbidden when targeting user from another company", async () => {
    vi.mocked(getCurrentSession).mockResolvedValueOnce({
      userId: "usr_admin_1",
      email: "admin@companyA.com",
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN" as any,
      companyId: "cmp_A",
      companyCode: "COMP_A",
      companyName: "Company A",
    });

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "usr_other",
      companyId: "cmp_B",
      email: "other@companyB.com",
      isActive: false,
      company: { id: "cmp_B", displayName: "Company B" },
    } as any);

    const req = new NextRequest("http://localhost:3000/api/admin/invitations/resend", {
      method: "POST",
      body: JSON.stringify({ userId: "usr_other" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("Cross-tenant invitation management is prohibited");
  });

  it("should return 400 Bad Request when target user is already ACTIVE", async () => {
    vi.mocked(getCurrentSession).mockResolvedValueOnce({
      userId: "usr_admin_1",
      email: "admin@companyA.com",
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN" as any,
      companyId: "cmp_A",
      companyCode: "COMP_A",
      companyName: "Company A",
    });

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "usr_active",
      companyId: "cmp_A",
      email: "active@companyA.com",
      isActive: true,
      company: { id: "cmp_A", displayName: "Company A" },
    } as any);

    const req = new NextRequest("http://localhost:3000/api/admin/invitations/resend", {
      method: "POST",
      body: JSON.stringify({ userId: "usr_active" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("account is already active");
  });

  it("should return 400 Bad Request when no valid activation token session exists", async () => {
    vi.mocked(getCurrentSession).mockResolvedValueOnce({
      userId: "usr_admin_1",
      email: "admin@companyA.com",
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN" as any,
      companyId: "cmp_A",
      companyCode: "COMP_A",
      companyName: "Company A",
    });

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "usr_inactive",
      companyId: "cmp_A",
      email: "inactive@companyA.com",
      isActive: false,
      company: { id: "cmp_A", displayName: "Company A" },
    } as any);

    vi.mocked(prisma.session.findFirst).mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost:3000/api/admin/invitations/resend", {
      method: "POST",
      body: JSON.stringify({ userId: "usr_inactive" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("No valid active activation token session exists");
  });

  it("should return 503 Service Unavailable when SMTP_PASS is missing from runtime environment", async () => {
    delete process.env.SMTP_PASS;
    delete process.env.SMTP_PASSWORD;

    vi.mocked(getCurrentSession).mockResolvedValueOnce({
      userId: "usr_admin_1",
      email: "admin@companyA.com",
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN" as any,
      companyId: "cmp_A",
      companyCode: "COMP_A",
      companyName: "Company A",
    });

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "usr_inactive",
      companyId: "cmp_A",
      email: "inactive@companyA.com",
      firstName: "Mohan",
      lastName: "Kumar",
      role: "ADMIN",
      isActive: false,
      company: { id: "cmp_A", displayName: "Company A" },
    } as any);

    vi.mocked(prisma.session.findFirst).mockResolvedValueOnce({
      id: "sess_123",
      userId: "usr_inactive",
      expiresAt: new Date(Date.now() + 100000),
    } as any);

    const req = new NextRequest("http://localhost:3000/api/admin/invitations/resend", {
      method: "POST",
      body: JSON.stringify({ userId: "usr_inactive" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("Production email provider is not configured");
  });

  it("should return 503 Service Unavailable when SMTPEmailProvider returns a mock Message-ID", async () => {
    process.env.SMTP_PASS = "mock_pass";

    vi.mocked(getCurrentSession).mockResolvedValueOnce({
      userId: "usr_admin_1",
      email: "admin@companyA.com",
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN" as any,
      companyId: "cmp_A",
      companyCode: "COMP_A",
      companyName: "Company A",
    });

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "usr_inactive",
      companyId: "cmp_A",
      email: "inactive@companyA.com",
      firstName: "Mohan",
      lastName: "Kumar",
      role: "ADMIN",
      isActive: false,
      company: { id: "cmp_A", displayName: "Company A" },
    } as any);

    vi.mocked(prisma.session.findFirst).mockResolvedValueOnce({
      id: "sess_123",
      userId: "usr_inactive",
      expiresAt: new Date(Date.now() + 100000),
    } as any);

    const spy = vi.spyOn(SMTPEmailProvider.prototype, "sendEmail").mockResolvedValueOnce({
      success: true,
      messageId: "MSG-SMTP-12345-MOCK",
      status: "SENT",
      timestamp: new Date().toISOString(),
    });

    const req = new NextRequest("http://localhost:3000/api/admin/invitations/resend", {
      method: "POST",
      body: JSON.stringify({ userId: "usr_inactive" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("sandbox mode");

    spy.mockRestore();
  });

  it("should return 200 OK and sanitized response for live SMTPEmailProvider submission", async () => {
    process.env.SMTP_PASS = "valid_live_pass";

    vi.mocked(getCurrentSession).mockResolvedValueOnce({
      userId: "usr_admin_1",
      email: "admin@companyA.com",
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN" as any,
      companyId: "cmp_A",
      companyCode: "COMP_A",
      companyName: "Company A",
    });

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "usr_inactive",
      companyId: "cmp_A",
      email: "inactive@companyA.com",
      firstName: "Mohan",
      lastName: "Kumar",
      role: "ADMIN",
      isActive: false,
      company: { id: "cmp_A", displayName: "Company A" },
    } as any);

    vi.mocked(prisma.session.findFirst).mockResolvedValueOnce({
      id: "sess_123",
      userId: "usr_inactive",
      expiresAt: new Date(Date.now() + 100000),
    } as any);

    const spy = vi.spyOn(SMTPEmailProvider.prototype, "sendEmail").mockResolvedValueOnce({
      success: true,
      messageId: "<178715.1001@splinci.com>",
      status: "SENT",
      timestamp: new Date().toISOString(),
    });

    const req = new NextRequest("http://localhost:3000/api/admin/invitations/resend", {
      method: "POST",
      body: JSON.stringify({ userId: "usr_inactive" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain("submitted successfully");
    expect(body.data.recipientEmail).toBe("inactive@companyA.com");
    expect(body.data.token).toBeUndefined(); // Zero secrets/tokens returned
    expect(body.data.password).toBeUndefined();

    spy.mockRestore();
  });
});

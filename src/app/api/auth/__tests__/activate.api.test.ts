import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../activate/route";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    session: {
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

vi.mock("@/services/audit.service", () => ({
  auditService: {
    log: vi.fn().mockResolvedValue(true),
  },
}));

describe("POST /api/auth/activate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 Bad Request when token is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/activate", {
      method: "POST",
      body: JSON.stringify({ password: "NewPassword123!" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Missing required parameters");
  });

  it("should return 400 Bad Request when password is under 8 characters", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/activate", {
      method: "POST",
      body: JSON.stringify({ token: "tok_123", password: "short" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("at least 8 characters");
  });

  it("should return 400 Bad Request for an invalid or expired token", async () => {
    vi.mocked(prisma.session.findFirst).mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost:3000/api/auth/activate", {
      method: "POST",
      body: JSON.stringify({ token: "invalid_tok", password: "ValidPassword123!" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Invalid or expired activation token");
  });

  it("should return 400 Bad Request if user account is already active", async () => {
    vi.mocked(prisma.session.findFirst).mockResolvedValueOnce({
      id: "sess_123",
      userId: "usr_123",
      expiresAt: new Date(Date.now() + 100000),
      user: {
        id: "usr_123",
        email: "admin@company.com",
        isActive: true,
        company: { code: "CMP" },
      },
    } as any);

    const req = new NextRequest("http://localhost:3000/api/auth/activate", {
      method: "POST",
      body: JSON.stringify({ token: "tok_123", password: "ValidPassword123!" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Account is already active");
  });

  it("should successfully activate inactive user and consume token on valid request", async () => {
    vi.mocked(prisma.session.findFirst).mockResolvedValueOnce({
      id: "sess_valid",
      userId: "usr_inactive",
      expiresAt: new Date(Date.now() + 100000),
      user: {
        id: "usr_inactive",
        email: "mohan@company.com",
        isActive: false,
        companyId: "cmp_123",
        company: { code: "SM_G-1111" },
      },
    } as any);

    const req = new NextRequest("http://localhost:3000/api/auth/activate", {
      method: "POST",
      body: JSON.stringify({ token: "tok_valid", password: "NewStrongPassword123!" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain("activated successfully");
    expect(body.data.recipientEmail).toBe("mohan@company.com");
    expect(body.data.password).toBeUndefined();
    expect(body.data.token).toBeUndefined();

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "usr_inactive" },
      data: expect.objectContaining({
        isActive: true,
        passwordHash: expect.any(String),
      }),
    });

    expect(prisma.session.delete).toHaveBeenCalledWith({
      where: { id: "sess_valid" },
    });
  });
});

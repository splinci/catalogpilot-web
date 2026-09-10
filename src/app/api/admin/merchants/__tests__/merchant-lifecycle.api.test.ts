import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, PATCH, DELETE } from "../[id]/route";
import { POST as resendInvitation } from "../[id]/resend-invitation/route";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/auth", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    company: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    session: {
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
    auditLog: {
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(prisma)),
  },
}));

describe("Phase 3A — Merchant Lifecycle Actions API Unit Test Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Platform Admin Authorization & Unauthenticated Guards", () => {
    it("should return 401 Unauthorized for unauthenticated GET request", async () => {
      vi.mocked(getCurrentSession).mockResolvedValueOnce(null);

      const req = new NextRequest("http://localhost:3060/api/admin/merchants/cmp_test_01", { method: "GET" });
      const res = await GET(req, { params: Promise.resolve({ id: "cmp_test_01" }) });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it("should return 401 Unauthorized for unauthenticated PATCH request", async () => {
      vi.mocked(getCurrentSession).mockResolvedValueOnce(null);

      const req = new NextRequest("http://localhost:3060/api/admin/merchants/cmp_test_01", {
        method: "PATCH",
        body: JSON.stringify({ displayName: "New Name" }),
      });
      const res = await PATCH(req, { params: Promise.resolve({ id: "cmp_test_01" }) });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it("should return 401 Unauthorized for unauthenticated DELETE request", async () => {
      vi.mocked(getCurrentSession).mockResolvedValueOnce(null);

      const req = new NextRequest("http://localhost:3060/api/admin/merchants/cmp_test_01", { method: "DELETE" });
      const res = await DELETE(req, { params: Promise.resolve({ id: "cmp_test_01" }) });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it("should return 403 Forbidden for non-Platform-Admin user on PATCH request", async () => {
      vi.mocked(getCurrentSession).mockResolvedValueOnce({
        userId: "usr_regular_1",
        email: "regular@test.com",
        firstName: "Regular",
        lastName: "User",
        role: "CATALOG_EDITOR" as any,
        companyId: "cmp_regular",
        companyCode: "REGULAR",
        companyName: "Regular Co",
      });

      const req = new NextRequest("http://localhost:3060/api/admin/merchants/cmp_test_01", {
        method: "PATCH",
        body: JSON.stringify({ displayName: "New Name" }),
      });
      const res = await PATCH(req, { params: Promise.resolve({ id: "cmp_test_01" }) });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain("Forbidden");
    });
  });

  describe("2. Edit Merchant Specifications (PATCH)", () => {
    it("should allow Platform Admin to edit merchant company specifications", async () => {
      vi.mocked(getCurrentSession).mockResolvedValueOnce({
        userId: "usr_platform_admin",
        email: "info@splinci.com",
        firstName: "Splinci",
        lastName: "Admin",
        role: "ADMIN" as any,
        companyId: "cmp_splinci_01",
        companyCode: "SPLINCI",
        companyName: "Splinci Platform Operations",
      });

      vi.mocked(prisma.company.findFirst).mockResolvedValueOnce({
        id: "cmp_merchant_01",
        code: "MERCHANT01",
        displayName: "Old Name",
        legalName: "Old Legal Name",
        taxId: "TAX123",
        isActive: true,
      } as any);

      vi.mocked(prisma.company.update).mockResolvedValueOnce({
        id: "cmp_merchant_01",
        code: "MERCHANT01",
        displayName: "Updated Merchant Name",
        legalName: "Updated Legal Name",
        taxId: "TAX999",
        isActive: true,
      } as any);

      const req = new NextRequest("http://localhost:3060/api/admin/merchants/cmp_merchant_01", {
        method: "PATCH",
        body: JSON.stringify({
          displayName: "Updated Merchant Name",
          legalName: "Updated Legal Name",
          taxId: "TAX999",
        }),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: "cmp_merchant_01" }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.displayName).toBe("Updated Merchant Name");
    });
  });

  describe("3. Protected System Tenant Safeguards & Operational Dependency Safety (DELETE)", () => {
    it("should reject deletion of protected bootstrap system tenant SPLINCI with 403 Forbidden", async () => {
      vi.mocked(getCurrentSession).mockResolvedValueOnce({
        userId: "usr_platform_admin",
        email: "info@splinci.com",
        firstName: "Splinci",
        lastName: "Admin",
        role: "ADMIN" as any,
        companyId: "cmp_splinci_01",
        companyCode: "SPLINCI",
        companyName: "Splinci Platform Operations",
      });

      vi.mocked(prisma.company.findFirst).mockResolvedValueOnce({
        id: "cmp_splinci_01",
        code: "SPLINCI",
        displayName: "Splinci Platform Operations",
        _count: { products: 0, salesOrders: 0, invoices: 0, warehouses: 0, suppliers: 0, customers: 0 },
      } as any);

      const req = new NextRequest("http://localhost:3060/api/admin/merchants/cmp_splinci_01", { method: "DELETE" });
      const res = await DELETE(req, { params: Promise.resolve({ id: "cmp_splinci_01" }) });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain("Protected bootstrap system tenants cannot be deleted");
    });

    it("should reject deletion of merchant with active operational business data with 400 Bad Request", async () => {
      vi.mocked(getCurrentSession).mockResolvedValueOnce({
        userId: "usr_platform_admin",
        email: "info@splinci.com",
        firstName: "Splinci",
        lastName: "Admin",
        role: "ADMIN" as any,
        companyId: "cmp_splinci_01",
        companyCode: "SPLINCI",
        companyName: "Splinci Platform Operations",
      });

      vi.mocked(prisma.company.findFirst).mockResolvedValueOnce({
        id: "cmp_merchant_with_data",
        code: "ACTIVE_CO",
        displayName: "Active Merchant Co",
        _count: { products: 15, salesOrders: 5, invoices: 2, warehouses: 1, suppliers: 3, customers: 10 },
      } as any);

      const req = new NextRequest("http://localhost:3060/api/admin/merchants/cmp_merchant_with_data", { method: "DELETE" });
      const res = await DELETE(req, { params: Promise.resolve({ id: "cmp_merchant_with_data" }) });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("active operational data exists");
    });
  });
});

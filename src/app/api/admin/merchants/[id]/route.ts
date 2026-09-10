import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { prisma } from "@/lib/prisma";
import { AuditAction } from "@prisma/client";

export const runtime = "nodejs";

const PROTECTED_TENANTS = ["SPLINCI", "ATLAS", "cmp_splinci_01"];

function isProtectedTenant(company: { id: string; code: string }): boolean {
  return PROTECTED_TENANTS.includes(company.id) || PROTECTED_TENANTS.includes(company.code?.toUpperCase());
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Session missing or expired" },
        { status: 401 }
      );
    }

    const isPlatformAdmin = authorizationService.isPlatformAdmin(session);
    if (!isPlatformAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only Splinci Platform Administrators can view client details." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const company = await prisma.company.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            users: true,
            products: true,
            salesOrders: true,
            invoices: true,
            warehouses: true,
            suppliers: true,
            customers: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Merchant not found" },
        { status: 404 }
      );
    }

    // Calculate resend count from audit logs
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        companyId: id,
        action: AuditAction.USER_UPDATED,
      },
      select: { details: true },
    });

    const resendCount = auditLogs.filter((log) => {
      const details = log.details as any;
      return details && details.type === "INVITATION_RESENT";
    }).length;

    return NextResponse.json({
      success: true,
      data: {
        ...company,
        resendCount,
        isProtected: isProtectedTenant(company),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Session missing or expired" },
        { status: 401 }
      );
    }

    const isPlatformAdmin = authorizationService.isPlatformAdmin(session);
    if (!isPlatformAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only Splinci Platform Administrators can modify client details." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const existingCompany = await prisma.company.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { success: false, error: "Merchant not found" },
        { status: 404 }
      );
    }

    const isProtected = isProtectedTenant(existingCompany);

    // Safeguard: Protected tenants cannot be deactivated
    if (typeof body.isActive === "boolean" && !body.isActive && isProtected) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Protected bootstrap system tenants cannot be deactivated." },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (typeof body.displayName === "string" && body.displayName.trim()) {
      updateData.displayName = body.displayName.trim();
    }
    if (typeof body.legalName === "string" && body.legalName.trim()) {
      updateData.legalName = body.legalName.trim();
    }
    if (typeof body.taxId === "string") {
      updateData.taxId = body.taxId.trim() || null;
    }
    if (typeof body.isActive === "boolean") {
      updateData.isActive = body.isActive;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "Bad Request: No valid fields provided for update." },
        { status: 400 }
      );
    }

    const updatedCompany = await prisma.company.update({
      where: { id },
      data: updateData,
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        companyId: id,
        userId: session.userId,
        action: AuditAction.USER_UPDATED,
        entityName: "Company",
        entityId: id,
        details: {
          action: typeof body.isActive === "boolean" ? (body.isActive ? "ACTIVATE_MERCHANT" : "DEACTIVATE_MERCHANT") : "EDIT_MERCHANT",
          changes: updateData,
          updatedByEmail: session.email,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Merchant updated successfully.",
      data: updatedCompany,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Session missing or expired" },
        { status: 401 }
      );
    }

    const isPlatformAdmin = authorizationService.isPlatformAdmin(session);
    if (!isPlatformAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only Splinci Platform Administrators can delete client tenants." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const company = await prisma.company.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: {
            products: true,
            salesOrders: true,
            invoices: true,
            warehouses: true,
            suppliers: true,
            customers: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Merchant not found" },
        { status: 404 }
      );
    }

    // 1. Protected System Tenant Safeguard
    if (isProtectedTenant(company)) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Protected bootstrap system tenants cannot be deleted." },
        { status: 403 }
      );
    }

    // 2. Operational Business Data Dependency Safety Safeguard
    const counts = company._count;
    const totalOperationalData =
      counts.products +
      counts.salesOrders +
      counts.invoices +
      counts.warehouses +
      counts.suppliers +
      counts.customers;

    if (totalOperationalData > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete merchant '${company.displayName}' because active operational data exists (${counts.products} products, ${counts.salesOrders} orders, ${counts.invoices} invoices, ${counts.customers} customers). Please set the merchant to Inactive instead.`,
        },
        { status: 400 }
      );
    }

    // 3. Clean Transactional Deletion for Unused Provisioned Merchant
    await prisma.$transaction(async (tx) => {
      // Delete audit logs
      await tx.auditLog.deleteMany({ where: { companyId: id } });

      // Find user IDs
      const users = await tx.user.findMany({
        where: { companyId: id },
        select: { id: true },
      });
      const userIds = users.map((u) => u.id);

      if (userIds.length > 0) {
        // Delete sessions for users
        await tx.session.deleteMany({ where: { userId: { in: userIds } } });
        // Delete users
        await tx.user.deleteMany({ where: { companyId: id } });
      }

      // Delete company
      await tx.company.delete({ where: { id } });
    });

    return NextResponse.json({
      success: true,
      message: `Merchant '${company.displayName}' deleted successfully.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

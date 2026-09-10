import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { authorizationService } from "@/services/authorization.service";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
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
        { success: false, error: "Forbidden: Only Splinci Platform Administrators can access the Client Directory." },
        { status: 403 }
      );
    }

    const companies = await prisma.company.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        users: {
          where: { role: "ADMIN" },
          take: 1,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            users: true,
            products: true,
            salesOrders: true,
          },
        },
      },
    });

    const formatted = companies.map((c) => {
      const primaryAdmin = c.users[0] || null;
      return {
        id: c.id,
        code: c.code,
        legalName: c.legalName,
        displayName: c.displayName,
        taxId: c.taxId,
        isActive: c.isActive,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        primaryAdmin: primaryAdmin
          ? {
              id: primaryAdmin.id,
              email: primaryAdmin.email,
              name: `${primaryAdmin.firstName || ""} ${primaryAdmin.lastName || ""}`.trim() || primaryAdmin.email,
              isActive: primaryAdmin.isActive,
              status: primaryAdmin.isActive ? "ACTIVE" : "INVITATION_PENDING",
            }
          : null,
        counts: {
          users: c._count.users,
          products: c._count.products,
          orders: c._count.salesOrders,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

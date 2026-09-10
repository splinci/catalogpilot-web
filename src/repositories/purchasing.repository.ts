import { prisma } from "@/lib/prisma";
import { POStatus, Prisma } from "@prisma/client";
import { CreatePurchaseOrderInput, PurchaseOrderQueryInput, ProcurementStats } from "@/types/purchasing.dto";

export class PurchasingRepository {
  async findMany(companyId: string, query: PurchaseOrderQueryInput) {
    const { page, limit, search, supplierId, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PurchaseOrderWhereInput = {
      companyId,
      deletedAt: null,
      ...(supplierId && { supplierId }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { poNumber: { contains: search, mode: "insensitive" } },
          { supplier: { name: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          supplier: { select: { id: true, code: true, name: true } },
          lines: {
            include: {
              product: { select: { id: true, sku: true, title: true } },
            },
          },
          goodsReceipts: true,
        },
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(companyId: string, id: string) {
    return prisma.purchaseOrder.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        supplier: true,
        lines: {
          include: {
            product: true,
          },
        },
        goodsReceipts: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  async getStats(companyId: string): Promise<ProcurementStats> {
    const aggregate = await prisma.purchaseOrder.aggregate({
      where: { companyId, deletedAt: null },
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    const [openOrdersCount, pendingApprovalCount] = await Promise.all([
      prisma.purchaseOrder.count({
        where: {
          companyId,
          deletedAt: null,
          status: { in: [POStatus.SENT, POStatus.PARTIALLY_RECEIVED] },
        },
      }),
      prisma.purchaseOrder.count({
        where: {
          companyId,
          deletedAt: null,
          status: POStatus.PENDING_APPROVAL,
        },
      }),
    ]);

    return {
      totalOrders: aggregate._count.id || 0,
      totalSpend: Number(aggregate._sum.totalAmount || 0),
      openOrdersCount,
      pendingApprovalCount,
    };
  }

  async create(companyId: string, data: CreatePurchaseOrderInput, userId?: string) {
    const poCount = await prisma.purchaseOrder.count({ where: { companyId } });
    const poNumber = `PO-${String(poCount + 1).padStart(5, "0")}`;

    const totalAmount = data.lines.reduce(
      (sum, line) => sum + line.orderedQty * line.unitCost,
      0
    );

    return prisma.purchaseOrder.create({
      data: {
        companyId,
        poNumber,
        supplierId: data.supplierId,
        totalAmount,
        status: POStatus.DRAFT,
        createdBy: userId,
        lines: {
          create: data.lines.map((line) => ({
            companyId,
            productId: line.productId,
            orderedQty: line.orderedQty,
            unitCost: line.unitCost,
            totalCost: line.orderedQty * line.unitCost,
          })),
        },
      },
      include: {
        supplier: true,
        lines: {
          include: { product: true },
        },
      },
    });
  }

  async updateStatus(companyId: string, id: string, status: POStatus, userId?: string) {
    return prisma.purchaseOrder.updateMany({
      where: { id, companyId, deletedAt: null },
      data: {
        status,
        updatedBy: userId,
        version: { increment: 1 },
      },
    });
  }
}

export const purchasingRepository = new PurchasingRepository();

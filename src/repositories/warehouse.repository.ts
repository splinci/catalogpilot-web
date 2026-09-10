import { prisma } from "@/lib/prisma";
import { CreateWarehouseInput, CreateWarehouseBinInput } from "@/types/inventory.dto";

export class WarehouseRepository {
  async findMany(companyId: string) {
    return prisma.warehouse.findMany({
      where: { companyId, deletedAt: null },
      include: {
        bins: { where: { deletedAt: null } },
        _count: { select: { inventory: true } },
      },
      orderBy: { code: "asc" },
    });
  }

  async findById(companyId: string, id: string) {
    return prisma.warehouse.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        bins: { where: { deletedAt: null } },
        inventory: {
          include: {
            product: { select: { sku: true, title: true } },
          },
        },
      },
    });
  }

  async findByCode(companyId: string, code: string) {
    return prisma.warehouse.findFirst({
      where: { companyId, code: code.toUpperCase().trim(), deletedAt: null },
    });
  }

  async create(companyId: string, data: CreateWarehouseInput, userId?: string) {
    return prisma.warehouse.create({
      data: {
        companyId,
        code: data.code.toUpperCase().trim(),
        name: data.name.trim(),
        address: data.address,
        createdBy: userId,
      },
    });
  }

  async createBin(companyId: string, data: CreateWarehouseBinInput) {
    const warehouse = await this.findById(companyId, data.warehouseId);
    if (!warehouse) {
      throw new Error("Warehouse not found or access denied");
    }

    return prisma.warehouseBin.create({
      data: {
        warehouseId: data.warehouseId,
        binCode: data.binCode.toUpperCase().trim(),
        binType: data.binType,
      },
    });
  }
}

export const warehouseRepository = new WarehouseRepository();

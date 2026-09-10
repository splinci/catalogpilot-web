import { prisma } from "@/lib/prisma";
import { CreateBrandInput } from "@/types/pim.dto";

export class BrandRepository {
  async findMany(companyId: string) {
    return prisma.brand.findMany({
      where: { companyId, deletedAt: null },
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    });
  }

  async findById(companyId: string, id: string) {
    return prisma.brand.findFirst({
      where: { id, companyId, deletedAt: null },
    });
  }

  async findByName(companyId: string, name: string) {
    return prisma.brand.findFirst({
      where: { companyId, name: name.trim(), deletedAt: null },
    });
  }

  async create(companyId: string, data: CreateBrandInput, userId?: string) {
    return prisma.brand.create({
      data: {
        companyId,
        name: data.name.trim(),
        logoUrl: data.logoUrl,
        createdBy: userId,
      },
    });
  }

  async softDelete(companyId: string, id: string, userId?: string) {
    return prisma.brand.updateMany({
      where: { id, companyId, deletedAt: null },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  }
}

export const brandRepository = new BrandRepository();

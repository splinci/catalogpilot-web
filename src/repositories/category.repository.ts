import { prisma } from "@/lib/prisma";
import { CreateCategoryInput } from "@/types/pim.dto";

export class CategoryRepository {
  async findMany(companyId: string) {
    return prisma.category.findMany({
      where: { companyId, deletedAt: null },
      include: {
        parent: true,
        children: true,
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    });
  }

  async findById(companyId: string, id: string) {
    return prisma.category.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { parent: true, children: true },
    });
  }

  async findBySlug(companyId: string, slug: string) {
    return prisma.category.findFirst({
      where: { companyId, slug: slug.toLowerCase().trim(), deletedAt: null },
    });
  }

  async create(companyId: string, data: CreateCategoryInput, userId?: string) {
    return prisma.category.create({
      data: {
        companyId,
        name: data.name.trim(),
        slug: data.slug.toLowerCase().trim(),
        parentId: data.parentId,
        createdBy: userId,
      },
    });
  }

  async softDelete(companyId: string, id: string, userId?: string) {
    return prisma.category.updateMany({
      where: { id, companyId, deletedAt: null },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  }
}

export const categoryRepository = new CategoryRepository();

import { prisma } from "@/lib/prisma";

import type { CreateCategoryDto } from "@/domains/category/dto/create-category.dto";
import type { UpdateCategoryDto } from "@/domains/category/dto/update-category.dto";

export class CategoryRepository {
  async findAll(companyId: string) {
    return prisma.category.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async count(companyId: string) {
    return prisma.category.count({
      where: {
        companyId,
        deletedAt: null,
      },
    });
  }

  async findById(id: string, companyId?: string) {
    return prisma.category.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(companyId ? { companyId } : {}),
      },
    });
  }

  async findByCode(code: string, companyId?: string) {
    return prisma.category.findFirst({
      where: {
        slug: code,
        deletedAt: null,
        ...(companyId ? { companyId } : {}),
      },
    });
  }

  async create(companyId: string, data: CreateCategoryDto) {
    const slug = (data.code || data.name).toLowerCase().replace(/[^a-z0-9]/g, "-");
    return prisma.category.create({
      data: {
        companyId,
        name: data.name,
        slug,
      },
    });
  }

  async update(id: string, data: UpdateCategoryDto, companyId?: string) {
    const slug = (data.code || data.name).toLowerCase().replace(/[^a-z0-9]/g, "-");
    const existing = await this.findById(id, companyId);
    if (!existing) {
      throw new Error("Category not found or unauthorized.");
    }

    return prisma.category.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        slug,
      },
    });
  }

  async archive(id: string, companyId?: string) {
    const existing = await this.findById(id, companyId);
    if (!existing) {
      throw new Error("Category not found or unauthorized.");
    }

    return prisma.category.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

export const categoryRepository = new CategoryRepository();
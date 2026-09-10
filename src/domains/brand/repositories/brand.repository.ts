import { prisma } from "@/lib/prisma";

import type { CreateBrandDto } from "../dto/create-brand.dto";
import type { UpdateBrandDto } from "../dto/update-brand.dto";

export class BrandRepository {
  async findAll(companyId: string) {
    return prisma.brand.findMany({
      where: {
        companyId,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async count(companyId: string) {
    return prisma.brand.count({
      where: {
        companyId,
      },
    });
  }

  async findById(id: string, companyId?: string) {
    return prisma.brand.findFirst({
      where: {
        id,
        ...(companyId ? { companyId } : {}),
      },
    });
  }

  async findByCode(code: string, companyId?: string) {
    return prisma.brand.findFirst({
      where: {
        name: code,
        ...(companyId ? { companyId } : {}),
      },
    });
  }

  async create(companyId: string, data: CreateBrandDto) {
    return prisma.brand.create({
      data: {
        companyId,
        name: data.name,
        logoUrl: data.logoUrl,
      },
    });
  }

  async update(id: string, data: UpdateBrandDto, companyId?: string) {
    const existing = await this.findById(id, companyId);
    if (!existing) {
      throw new Error("Brand not found or unauthorized.");
    }

    return prisma.brand.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        logoUrl: data.logoUrl,
      },
    });
  }

  async delete(id: string, companyId?: string) {
    const existing = await this.findById(id, companyId);
    if (!existing) {
      throw new Error("Brand not found or unauthorized.");
    }

    return prisma.brand.delete({
      where: {
        id,
      },
    });
  }
}

export const brandRepository = new BrandRepository();
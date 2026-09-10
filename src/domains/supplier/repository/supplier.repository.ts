import { prisma } from "@/lib/prisma";

import type { CreateSupplierDto } from "../dto/create-supplier.dto";
import type { UpdateSupplierDto } from "../dto/update-supplier.dto";

export class SupplierRepository {
  async findAll() {
    return prisma.supplier.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }

  async count() {
    return prisma.supplier.count();
  }

  async findById(id: string) {
    return prisma.supplier.findUnique({
      where: {
        id,
      },
    });
  }

  async findByCode(code: string) {
    return prisma.supplier.findFirst({
      where: {
        code,
      },
    });
  }

  async create(data: CreateSupplierDto) {
    return prisma.supplier.create({
      data: {
        companyId: "cmp_atlas_01",
        code: data.code,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
      },
    });
  }

  async update(data: UpdateSupplierDto) {
    return prisma.supplier.update({
      where: {
        id: data.id,
      },
      data: {
        code: data.code,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
      },
    });
  }

  async archive(id: string) {
    return prisma.supplier.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async getStatistics() {
    const [total, active, inactive] = await Promise.all([
      prisma.supplier.count(),
      prisma.supplier.count({
        where: {
          deletedAt: null,
        },
      }),
      prisma.supplier.count({
        where: {
          deletedAt: { not: null },
        },
      }),
    ]);

    return {
      total,
      active,
      inactive,
    };
  }
}

export const supplierRepository = new SupplierRepository();
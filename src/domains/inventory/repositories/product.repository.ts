import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";

import type { CreateProductDto } from "../dto/create-product.dto";
import type { UpdateProductDto } from "../dto/update-product.dto";
import type { InventoryStatsDto } from "../dto/inventory-stats.dto";
import { MAX_PAGE_LIMIT, DEFAULT_PAGE_LIMIT } from "@/lib/pagination";

export const productRepository = {
  async findAll(companyId: string, pagination?: { skip?: number; take?: number }) {
    const take = Math.min(pagination?.take || DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT);
    const skip = pagination?.skip || 0;

    return prisma.product.findMany({
      where: {
        companyId,
        status: ProductStatus.PUBLISHED,
      },
      include: {
        category: true,
        brand: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
    });
  },

  async findById(id: string, companyId?: string) {
    return prisma.product.findFirst({
      where: {
        id,
        ...(companyId && { companyId }),
      },
      include: {
        category: true,
        brand: true,
      },
    });
  },

  async findBySku(companyId: string, sku: string) {
    return prisma.product.findFirst({
      where: {
        companyId,
        sku,
      },
      include: {
        category: true,
        brand: true,
      },
    });
  },

  async create(companyId: string, dto: CreateProductDto) {
    return prisma.product.create({
      data: {
        companyId,
        sku: dto.sku,
        title: dto.name,
        description: dto.description || null,
        brandId: dto.brandId || null,
        categoryId: dto.categoryId || null,
        price: dto.sellingPrice,
        costPrice: dto.costPrice,
        status: ProductStatus.PUBLISHED,
      },
      include: {
        category: true,
        brand: true,
      },
    });
  },

  async update(id: string, companyId: string, dto: UpdateProductDto) {
    return prisma.product.update({
      where: { id },
      data: {
        sku: dto.sku,
        title: dto.name,
        description: dto.description || null,
        brandId: dto.brandId || null,
        categoryId: dto.categoryId || null,
        price: dto.sellingPrice,
        costPrice: dto.costPrice,
        status: (dto.status as any) || ProductStatus.PUBLISHED,
      },
      include: {
        category: true,
        brand: true,
      },
    });
  },

  async archive(id: string, companyId: string) {
    return prisma.product.update({
      where: { id },
      data: {
        status: ProductStatus.ARCHIVED,
      },
      include: {
        category: true,
        brand: true,
      },
    });
  },

  async getInventoryStats(companyId: string): Promise<InventoryStatsDto> {
    const [total, active, archived, items] = await Promise.all([
      prisma.product.count({
        where: { companyId },
      }),
      prisma.product.count({
        where: {
          companyId,
          status: ProductStatus.PUBLISHED,
        },
      }),
      prisma.product.count({
        where: {
          companyId,
          status: ProductStatus.ARCHIVED,
        },
      }),
      prisma.inventoryItem.findMany({
        where: { companyId },
        select: {
          availableQty: true,
          reorderLevel: true,
        },
      }),
    ]);

    const inventoryItems = Array.isArray(items) ? items : [];
    const lowStock = inventoryItems.filter(
      (item) => item && item.availableQty <= item.reorderLevel
    ).length;

    return {
      total: total || 0,
      active: active || 0,
      archived: archived || 0,
      lowStock: lowStock || 0,
    };
  },
};
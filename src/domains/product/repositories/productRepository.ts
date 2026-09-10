import { Prisma, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

import type { CreateProductDto } from "../dto/createProduct.dto";
import type { UpdateProductDto } from "../dto/updateProduct.dto";
import type { ProductFilters } from "../types/productFilters";

const productInclude = {
  brand: true,
  category: true,
  supplier: true,
} satisfies Prisma.ProductInclude;

function buildWhereClause(
  filters: ProductFilters
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};

  if (filters.search) {
    where.OR = [
      {
        title: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        sku: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
    ];
  }

  return where;
}

class ProductRepository {
  async findAll(companyId: string, filters: ProductFilters = {}) {
    return prisma.product.findMany({
      where: {
        companyId,
        deletedAt: null,
        ...buildWhereClause(filters),
      },
      include: productInclude,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async count(companyId: string, filters: ProductFilters = {}) {
    return prisma.product.count({
      where: {
        companyId,
        deletedAt: null,
        ...buildWhereClause(filters),
      },
    });
  }

  async findById(id: string, companyId?: string) {
    return prisma.product.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(companyId ? { companyId } : {}),
      },
      include: productInclude,
    });
  }

  async create(companyId: string, data: CreateProductDto) {
    return prisma.product.create({
      data: {
        companyId,
        sku: data.sku,
        title: data.name,
        description: data.description || null,
        brandId: data.brandId || null,
        categoryId: data.categoryId || null,
        supplierId: data.supplierId || null,
        price: data.sellingPrice,
        costPrice: data.costPrice,
        status: ProductStatus.PUBLISHED,
      },
      include: productInclude,
    });
  }

  async update(data: UpdateProductDto) {
    return prisma.product.update({
      where: {
        id: data.id,
      },
      data: {
        sku: data.sku,
        title: data.name,
        description: data.description || null,
        brandId: data.brandId || null,
        categoryId: data.categoryId || null,
        supplierId: data.supplierId || null,
        price: data.sellingPrice,
        costPrice: data.costPrice,
        status: (data.status as any) || ProductStatus.PUBLISHED,
      },
      include: productInclude,
    });
  }

  async archive(id: string) {
    return prisma.product.update({
      where: {
        id,
      },
      data: {
        status: ProductStatus.ARCHIVED,
      },
    });
  }
}

export const productRepository = new ProductRepository();
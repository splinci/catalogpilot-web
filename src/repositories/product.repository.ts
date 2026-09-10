import { prisma } from "@/lib/prisma";
import { ProductStatus, Prisma } from "@prisma/client";
import { CreateProductInput, UpdateProductInput, ProductQueryInput } from "@/types/pim.dto";

export class ProductRepository {
  async findMany(companyId: string, query: ProductQueryInput) {
    const { page, limit, search, categoryId, brandId, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      companyId,
      deletedAt: null,
      ...(status && { status }),
      ...(categoryId && { categoryId }),
      ...(brandId && { brandId }),
      ...(search && {
        OR: [
          { sku: { contains: search, mode: "insensitive" } },
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          category: true,
          brand: true,
          supplier: true,
          variants: true,
          assets: true,
        },
      }),
      prisma.product.count({ where }),
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
    return prisma.product.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        category: true,
        brand: true,
        supplier: true,
        variants: true,
        assets: true,
        digitalAssets: true,
      },
    });
  }

  async findBySku(companyId: string, sku: string) {
    return prisma.product.findFirst({
      where: {
        companyId,
        sku: sku.trim(),
        deletedAt: null,
      },
    });
  }

  async create(companyId: string, data: CreateProductInput, initialQualityScore: number, userId?: string) {
    const { variants, assets, ...masterData } = data;

    return prisma.product.create({
      data: {
        companyId,
        sku: masterData.sku.toUpperCase().trim(),
        title: masterData.title.trim(),
        description: masterData.description,
        categoryId: masterData.categoryId,
        brandId: masterData.brandId,
        supplierId: masterData.supplierId,
        price: masterData.price,
        costPrice: masterData.costPrice ?? 0,
        status: ProductStatus.DRAFT,
        qualityScore: initialQualityScore,
        createdBy: userId,
        variants: {
          create: variants.map((v) => ({
            variantSku: v.variantSku.toUpperCase().trim(),
            name: v.name,
            price: v.price,
            options: v.options ?? {},
          })),
        },
        assets: {
          create: assets.map((a) => ({
            assetUrl: a.assetUrl,
            assetType: a.assetType,
            isPrimary: a.isPrimary,
          })),
        },
      },
      include: {
        category: true,
        brand: true,
        supplier: true,
        variants: true,
        assets: true,
      },
    });
  }

  async update(companyId: string, id: string, data: UpdateProductInput, newQualityScore: number, userId?: string) {
    const { variants, assets, version, ...masterData } = data;

    return prisma.$transaction(async (tx) => {
      // Optimistic concurrency check if version specified
      if (version !== undefined) {
        const existing = await tx.product.findFirst({
          where: { id, companyId, deletedAt: null },
          select: { version: true },
        });

        if (!existing) {
          throw new Error("Product not found");
        }

        if (existing.version !== version) {
          throw new Error("Conflict: Product has been modified by another transaction");
        }
      }

      const updateData: Prisma.ProductUpdateInput = {
        ...(masterData.title && { title: masterData.title.trim() }),
        ...(masterData.description !== undefined && { description: masterData.description }),
        ...(masterData.categoryId !== undefined && { categoryId: masterData.categoryId }),
        ...(masterData.brandId !== undefined && { brandId: masterData.brandId }),
        ...(masterData.supplierId !== undefined && { supplierId: masterData.supplierId }),
        ...(masterData.price !== undefined && { price: masterData.price }),
        ...(masterData.costPrice !== undefined && { costPrice: masterData.costPrice }),
        qualityScore: newQualityScore,
        updatedBy: userId,
        version: { increment: 1 },
      };

      if (variants) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        updateData.variants = {
          create: variants.map((v) => ({
            variantSku: v.variantSku.toUpperCase().trim(),
            name: v.name,
            price: v.price,
            options: v.options ?? {},
          })),
        };
      }

      if (assets) {
        await tx.productAsset.deleteMany({ where: { productId: id } });
        updateData.assets = {
          create: assets.map((a) => ({
            assetUrl: a.assetUrl,
            assetType: a.assetType,
            isPrimary: a.isPrimary,
          })),
        };
      }

      return tx.product.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
          brand: true,
          supplier: true,
          variants: true,
          assets: true,
        },
      });
    });
  }

  async updateStatus(companyId: string, id: string, status: ProductStatus, userId?: string) {
    return prisma.product.updateMany({
      where: { id, companyId, deletedAt: null },
      data: {
        status,
        updatedBy: userId,
        version: { increment: 1 },
      },
    });
  }

  async softDelete(companyId: string, id: string, userId?: string) {
    return prisma.product.updateMany({
      where: { id, companyId, deletedAt: null },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
        status: ProductStatus.ARCHIVED,
      },
    });
  }
}

export const productRepository = new ProductRepository();

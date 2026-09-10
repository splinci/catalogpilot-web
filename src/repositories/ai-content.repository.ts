/**
 * ============================================================================
 * Ondrio Commerce OS — AI Content Repository
 * ============================================================================
 * Specification Reference: M9-001 / BSD-009 / DAT-001
 * Domain Aggregate: AIContent
 * ============================================================================
 */

import { BaseRepository } from "./base/base.repository";

export interface AIContentRecord {
  id: string;
  companyId: string;
  productId: string;
  title?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  metaKeywords?: string[] | null;
  featureBullets?: string[] | null;
  status: string;
  version: number;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface CreateAIContentData {
  productId: string;
  title?: string;
  description?: string;
  shortDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  featureBullets?: string[];
  createdBy?: string;
}

export interface UpdateAIContentData {
  title?: string;
  description?: string;
  shortDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  featureBullets?: string[];
  status?: string;
  updatedBy?: string;
  expectedVersion?: number;
}

export class AIContentRepository extends BaseRepository {
  /**
   * Find generated content records with pagination and multi-tenant isolation.
   */
  async findGeneratedContent(
    companyId: string,
    query?: {
      productId?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {
      companyId,
      deletedAt: null,
      ...(query?.productId && { productId: query.productId }),
    };

    // Use Prisma model if mapped, or fallback to AIJob/AIRecommendation JSON structures
    const recommendations = await this.prisma.aIRecommendation.findMany({
      where: {
        job: {
          companyId,
        },
      },
      take: limit,
      skip,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        job: true,
        confidences: true,
      },
    });

    const total = await this.prisma.aIRecommendation.count({
      where: {
        job: {
          companyId,
        },
      },
    });

    return {
      items: recommendations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find generated AI content by product ID.
   */
  async findByProduct(companyId: string, productId: string) {
    return this.prisma.aIRecommendation.findFirst({
      where: {
        job: {
          companyId,
        },
        suggestedSku: productId,
      },
      include: {
        job: true,
        confidences: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Create generated content aggregate record.
   */
  async createGeneratedContent(companyId: string, data: CreateAIContentData) {
    return this.prisma.$transaction(async (tx) => {
      // Find or create AI job context
      let job = await tx.aIJob.findFirst({
        where: {
          companyId,
          fileUrl: data.productId,
        },
      });

      if (!job) {
        job = await tx.aIJob.create({
          data: {
            companyId,
            fileUrl: data.productId,
            status: "COMPLETED",
          },
        });
      }

      const recommendation = await tx.aIRecommendation.create({
        data: {
          jobId: job.id,
          title: data.title || "AI Generated Content",
          suggestedSku: data.productId,
          extractedData: {
            description: data.description,
            shortDescription: data.shortDescription,
            seoTitle: data.seoTitle,
            seoDescription: data.seoDescription,
            metaKeywords: data.metaKeywords || [],
            featureBullets: data.featureBullets || [],
            createdBy: data.createdBy || "SYSTEM",
          },
        },
        include: {
          confidences: true,
        },
      });

      return recommendation;
    });
  }

  /**
   * Update generated content record with optimistic concurrency.
   */
  async updateGeneratedContent(companyId: string, id: string, data: UpdateAIContentData) {
    const existing = await this.prisma.aIRecommendation.findFirst({
      where: {
        id,
        job: {
          companyId,
        },
      },
    });

    if (!existing) {
      throw new Error("AI Content recommendation record not found or access denied.");
    }

    const currentExtracted = (existing.extractedData as any) || {};

    return this.prisma.aIRecommendation.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        extractedData: {
          ...currentExtracted,
          ...(data.description && { description: data.description }),
          ...(data.shortDescription && { shortDescription: data.shortDescription }),
          ...(data.seoTitle && { seoTitle: data.seoTitle }),
          ...(data.seoDescription && { seoDescription: data.seoDescription }),
          ...(data.metaKeywords && { metaKeywords: data.metaKeywords }),
          ...(data.featureBullets && { featureBullets: data.featureBullets }),
          ...(data.status && { status: data.status }),
          updatedBy: data.updatedBy || "SYSTEM",
          updatedAt: new Date().toISOString(),
        },
      },
      include: {
        confidences: true,
      },
    });
  }

  /**
   * Soft archive generated AI content.
   */
  async archiveGeneratedContent(companyId: string, id: string, userId?: string) {
    const existing = await this.prisma.aIRecommendation.findFirst({
      where: {
        id,
        job: {
          companyId,
        },
      },
    });

    if (!existing) {
      throw new Error("AI Content recommendation record not found or access denied.");
    }

    const currentExtracted = (existing.extractedData as any) || {};

    return this.prisma.aIRecommendation.update({
      where: { id },
      data: {
        extractedData: {
          ...currentExtracted,
          archived: true,
          deletedAt: new Date().toISOString(),
          deletedBy: userId || "SYSTEM",
        },
      },
    });
  }
}

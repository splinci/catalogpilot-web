/**
 * ============================================================================
 * Ondrio Commerce OS — AI Classification Repository
 * ============================================================================
 * Specification Reference: M9-001 / BSD-009 / DAT-001
 * Domain Aggregate: AIClassification / AIConfidenceScore
 * ============================================================================
 */

import { BaseRepository } from "./base/base.repository";

export interface StorePredictionData {
  productId: string;
  categoryPrediction?: {
    categoryId: string;
    categoryName: string;
    score: number;
  };
  brandPrediction?: {
    brandId: string;
    brandName: string;
    score: number;
  };
  attributePredictions?: Array<{
    attributeId?: string;
    fieldName: string;
    suggestedValue: string;
    score: number;
  }>;
  predictedTags?: Array<{
    tag: string;
    score: number;
  }>;
  createdBy?: string;
}

export class AIClassificationRepository extends BaseRepository {
  /**
   * Predict and fetch category predictions with confidence scores.
   */
  async predictCategory(companyId: string, productId: string) {
    const rec = await this.prisma.aIRecommendation.findFirst({
      where: {
        job: { companyId },
        suggestedSku: productId,
      },
      include: {
        confidences: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!rec) return null;

    const catScore = rec.confidences.find((c) => c.fieldName === "category")?.score ?? 0.85;
    const extracted = (rec.extractedData as any) || {};

    return {
      productId,
      predictedCategory: extracted.predictedCategory || "General",
      confidenceScore: catScore,
      recommendationId: rec.id,
    };
  }

  /**
   * Predict and fetch brand predictions with confidence scores.
   */
  async predictBrand(companyId: string, productId: string) {
    const rec = await this.prisma.aIRecommendation.findFirst({
      where: {
        job: { companyId },
        suggestedSku: productId,
      },
      include: {
        confidences: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!rec) return null;

    const brandScore = rec.confidences.find((c) => c.fieldName === "brand")?.score ?? 0.9;
    const extracted = (rec.extractedData as any) || {};

    return {
      productId,
      predictedBrand: extracted.predictedBrand || "Generic",
      confidenceScore: brandScore,
      recommendationId: rec.id,
    };
  }

  /**
   * Predict and fetch attributes predictions with confidence scores.
   */
  async predictAttributes(companyId: string, productId: string) {
    const rec = await this.prisma.aIRecommendation.findFirst({
      where: {
        job: { companyId },
        suggestedSku: productId,
      },
      include: {
        confidences: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!rec) return [];

    const extracted = (rec.extractedData as any) || {};
    const predictedAttributes = extracted.predictedAttributes || [];

    return predictedAttributes.map((attr: any) => {
      const conf = rec.confidences.find((c) => c.fieldName === attr.fieldName);
      return {
        fieldName: attr.fieldName,
        suggestedValue: attr.suggestedValue,
        confidenceScore: conf?.score ?? 0.88,
      };
    });
  }

  /**
   * Predict and fetch product tags with confidence scores.
   */
  async predictTags(companyId: string, productId: string) {
    const rec = await this.prisma.aIRecommendation.findFirst({
      where: {
        job: { companyId },
        suggestedSku: productId,
      },
      include: {
        confidences: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!rec) return [];

    const extracted = (rec.extractedData as any) || {};
    return extracted.predictedTags || [];
  }

  /**
   * Store AI classification predictions atomically with confidence scores.
   */
  async storePredictions(companyId: string, data: StorePredictionData) {
    return this.prisma.$transaction(async (tx) => {
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
          title: "AI Category & Attribute Classification",
          suggestedSku: data.productId,
          extractedData: {
            predictedCategory: data.categoryPrediction?.categoryName,
            predictedCategoryId: data.categoryPrediction?.categoryId,
            predictedBrand: data.brandPrediction?.brandName,
            predictedBrandId: data.brandPrediction?.brandId,
            predictedAttributes: data.attributePredictions || [],
            predictedTags: data.predictedTags || [],
            createdBy: data.createdBy || "SYSTEM",
          },
        },
      });

      const confidencesToCreate = [];

      if (data.categoryPrediction) {
        confidencesToCreate.push({
          recommendationId: recommendation.id,
          fieldName: "category",
          score: data.categoryPrediction.score,
        });
      }

      if (data.brandPrediction) {
        confidencesToCreate.push({
          recommendationId: recommendation.id,
          fieldName: "brand",
          score: data.brandPrediction.score,
        });
      }

      if (data.attributePredictions) {
        for (const attr of data.attributePredictions) {
          confidencesToCreate.push({
            recommendationId: recommendation.id,
            fieldName: attr.fieldName,
            score: attr.score,
          });
        }
      }

      if (confidencesToCreate.length > 0) {
        await tx.aIConfidenceScore.createMany({
          data: confidencesToCreate,
        });
      }

      return tx.aIRecommendation.findUnique({
        where: { id: recommendation.id },
        include: { confidences: true },
      });
    });
  }

  /**
   * Find prediction history for a product.
   */
  async findPredictionHistory(companyId: string, productId: string) {
    return this.prisma.aIRecommendation.findMany({
      where: {
        job: { companyId },
        suggestedSku: productId,
      },
      include: {
        confidences: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

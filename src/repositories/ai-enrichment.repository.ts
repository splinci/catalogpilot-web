/**
 * ============================================================================
 * Ondrio Commerce OS — AI Enrichment Repository
 * ============================================================================
 * Specification Reference: M9-001 / BSD-009 / DAT-001
 * Domain Aggregate: AIEnrichment
 * ============================================================================
 */

import { BaseRepository } from "./base/base.repository";

export interface CreateEnrichmentData {
  productId: string;
  originalValues: Record<string, any>;
  aiSuggestions: Record<string, any>;
  status?: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "APPLIED";
  createdBy?: string;
}

export interface UpdateEnrichmentData {
  aiSuggestions?: Record<string, any>;
  approvedValues?: Record<string, any>;
  status?: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "APPLIED";
  updatedBy?: string;
}

export class AIEnrichmentRepository extends BaseRepository {
  /**
   * Create an AI catalog enrichment suggestion record.
   */
  async createEnrichment(companyId: string, data: CreateEnrichmentData) {
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
            status: "PROCESSING",
          },
        });
      }

      return tx.aIRecommendation.create({
        data: {
          jobId: job.id,
          title: `AI Catalog Enrichment Proposal for Product ${data.productId}`,
          suggestedSku: data.productId,
          extractedData: {
            productId: data.productId,
            originalValues: data.originalValues,
            aiSuggestions: data.aiSuggestions,
            approvedValues: null,
            status: data.status || "PENDING_REVIEW",
            createdBy: data.createdBy || "SYSTEM",
            createdAt: new Date().toISOString(),
          },
        },
        include: {
          job: true,
          confidences: true,
        },
      });
    });
  }

  /**
   * Update an enrichment proposal record.
   */
  async updateEnrichment(companyId: string, id: string, data: UpdateEnrichmentData) {
    const existing = await this.prisma.aIRecommendation.findFirst({
      where: {
        id,
        job: { companyId },
      },
    });

    if (!existing) {
      throw new Error("AI Enrichment proposal record not found or access denied.");
    }

    const currentExtracted = (existing.extractedData as any) || {};

    return this.prisma.aIRecommendation.update({
      where: { id },
      data: {
        extractedData: {
          ...currentExtracted,
          ...(data.aiSuggestions && { aiSuggestions: data.aiSuggestions }),
          ...(data.approvedValues && { approvedValues: data.approvedValues }),
          ...(data.status && { status: data.status }),
          updatedBy: data.updatedBy || "SYSTEM",
          updatedAt: new Date().toISOString(),
        },
      },
      include: {
        job: true,
        confidences: true,
      },
    });
  }

  /**
   * Find an enrichment proposal by ID with multi-tenant isolation.
   */
  async findEnrichment(companyId: string, id: string) {
    return this.prisma.aIRecommendation.findFirst({
      where: {
        id,
        job: { companyId },
      },
      include: {
        job: true,
        confidences: true,
      },
    });
  }

  /**
   * Find all enrichment proposals for a product.
   */
  async findByProduct(companyId: string, productId: string) {
    return this.prisma.aIRecommendation.findMany({
      where: {
        job: { companyId },
        suggestedSku: productId,
      },
      include: {
        job: true,
        confidences: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Approve an AI enrichment proposal.
   */
  async approveEnrichment(companyId: string, id: string, reviewerId: string) {
    const existing = await this.prisma.aIRecommendation.findFirst({
      where: {
        id,
        job: { companyId },
      },
    });

    if (!existing) {
      throw new Error("AI Enrichment proposal record not found or access denied.");
    }

    const currentExtracted = (existing.extractedData as any) || {};

    return this.prisma.aIRecommendation.update({
      where: { id },
      data: {
        extractedData: {
          ...currentExtracted,
          status: "APPROVED",
          approvedValues: currentExtracted.aiSuggestions || {},
          reviewerId,
          reviewedAt: new Date().toISOString(),
          updatedBy: reviewerId,
          updatedAt: new Date().toISOString(),
        },
      },
      include: {
        job: true,
        confidences: true,
      },
    });
  }

  /**
   * Reject an AI enrichment proposal.
   */
  async rejectEnrichment(companyId: string, id: string, reviewerId: string, reason?: string) {
    const existing = await this.prisma.aIRecommendation.findFirst({
      where: {
        id,
        job: { companyId },
      },
    });

    if (!existing) {
      throw new Error("AI Enrichment proposal record not found or access denied.");
    }

    const currentExtracted = (existing.extractedData as any) || {};

    return this.prisma.aIRecommendation.update({
      where: { id },
      data: {
        extractedData: {
          ...currentExtracted,
          status: "REJECTED",
          rejectionReason: reason || "User rejected AI suggestions",
          reviewerId,
          reviewedAt: new Date().toISOString(),
          updatedBy: reviewerId,
          updatedAt: new Date().toISOString(),
        },
      },
      include: {
        job: true,
        confidences: true,
      },
    });
  }
}

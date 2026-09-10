/**
 * ============================================================================
 * Ondrio Commerce OS — AI Job Repository
 * ============================================================================
 * Specification Reference: M9-001 / BSD-009 / DAT-001
 * Domain Aggregate: AIJob
 * ============================================================================
 */

import { BaseRepository } from "./base/base.repository";
import { AIJobStatus, CreateAIJobInput, AIJobQueryInput } from "@/types/ai-catalog.dto";
import { IngestionStatus } from "@prisma/client";

export class AIJobRepository extends BaseRepository {
  /**
   * Create an AI catalog execution job.
   */
  async createJob(companyId: string, data: CreateAIJobInput) {
    const prismaStatus = this.mapStatusToPrisma(data.type ? "PENDING" : "INGESTED");

    return this.prisma.aIJob.create({
      data: {
        companyId,
        fileUrl: data.fileUrl || data.targetProductId || "batch_file",
        status: prismaStatus,
      },
      include: {
        recommendations: true,
      },
    });
  }

  /**
   * Find AI jobs with filtering and pagination.
   */
  async findJobs(companyId: string, query?: AIJobQueryInput) {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;
    const skip = (page - 1) * limit;

    const items = await this.prisma.aIJob.findMany({
      where: {
        companyId,
      },
      take: limit,
      skip,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        recommendations: {
          include: {
            confidences: true,
          },
        },
      },
    });

    const total = await this.prisma.aIJob.count({
      where: {
        companyId,
      },
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find an AI job by ID with tenant isolation.
   */
  async findById(companyId: string, id: string) {
    return this.prisma.aIJob.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        recommendations: {
          include: {
            confidences: true,
          },
        },
      },
    });
  }

  /**
   * Update AI job status.
   */
  async updateStatus(companyId: string, id: string, status: AIJobStatus) {
    const existing = await this.findById(companyId, id);
    if (!existing) {
      throw new Error("AI Job not found or access denied.");
    }

    const prismaStatus = this.mapStatusToPrisma(status);

    return this.prisma.aIJob.update({
      where: { id },
      data: {
        status: prismaStatus,
      },
      include: {
        recommendations: true,
      },
    });
  }

  /**
   * Update AI job execution progress percentage.
   */
  async updateProgress(companyId: string, id: string, progress: number) {
    const existing = await this.findById(companyId, id);
    if (!existing) {
      throw new Error("AI Job not found or access denied.");
    }

    const status = progress >= 100 ? "COMPLETED" : "PROCESSING";

    return this.prisma.aIJob.update({
      where: { id },
      data: {
        status: this.mapStatusToPrisma(status),
      },
      include: {
        recommendations: true,
      },
    });
  }

  /**
   * Mark AI job as completed with results.
   */
  async completeJob(companyId: string, id: string, result?: Record<string, any>) {
    const existing = await this.findById(companyId, id);
    if (!existing) {
      throw new Error("AI Job not found or access denied.");
    }

    return this.prisma.$transaction(async (tx) => {
      const job = await tx.aIJob.update({
        where: { id },
        data: {
          status: IngestionStatus.COMPLETED,
        },
      });

      if (result) {
        await tx.aIRecommendation.create({
          data: {
            jobId: id,
            title: result.title || "AI Job Result Summary",
            suggestedSku: result.productId || "RESULT",
            extractedData: result,
          },
        });
      }

      return tx.aIJob.findUnique({
        where: { id },
        include: { recommendations: true },
      });
    });
  }

  /**
   * Mark AI job as failed with error details.
   */
  async failJob(companyId: string, id: string, error: string) {
    const existing = await this.findById(companyId, id);
    if (!existing) {
      throw new Error("AI Job not found or access denied.");
    }

    return this.prisma.aIJob.update({
      where: { id },
      data: {
        status: IngestionStatus.FAILED,
      },
      include: {
        recommendations: true,
      },
    });
  }

  /**
   * Cancel a pending or running AI job.
   */
  async cancelJob(companyId: string, id: string, userId?: string) {
    const existing = await this.findById(companyId, id);
    if (!existing) {
      throw new Error("AI Job not found or access denied.");
    }

    return this.prisma.aIJob.update({
      where: { id },
      data: {
        status: IngestionStatus.FAILED,
      },
      include: {
        recommendations: true,
      },
    });
  }

  private mapStatusToPrisma(status: string): IngestionStatus {
    switch (status) {
      case "COMPLETED":
        return IngestionStatus.COMPLETED;
      case "RUNNING":
      case "PROCESSING":
      case "QUEUED":
        return IngestionStatus.PROCESSING;
      case "FAILED":
      case "CANCELLED":
        return IngestionStatus.FAILED;
      default:
        return IngestionStatus.INGESTED;
    }
  }
}

/**
 * ============================================================================
 * Ondrio Commerce OS — AI Job Service
 * ============================================================================
 * Specification Reference: M9-002 / BSD-009 / SAD-001
 * Domain Service: AI Processing Job Lifecycle Orchestration
 * ============================================================================
 */

import { AIJobRepository } from "@/repositories/ai-job.repository";
import { OutboxRepository } from "@/repositories/outbox.repository";
import { AuditService } from "../audit.service";
import { CreateAIJobInput, AIJobQueryInput, AIJobStatus } from "@/types/ai-catalog.dto";
import { AuditAction } from "@prisma/client";

export class AIJobService {
  constructor(
    private readonly jobRepo = new AIJobRepository(),
    private readonly outboxRepo = new OutboxRepository(),
    private readonly audit = new AuditService()
  ) {}

  /**
   * Create a new AI catalog execution job.
   */
  async createJob(companyId: string, userId: string, input: CreateAIJobInput) {
    const job = await this.jobRepo.createJob(companyId, {
      ...input,
      createdBy: userId,
    });

    await this.outboxRepo.create({
      companyId,
      eventType: "AIJobCreated",
      payload: {
        jobId: job.id,
        type: input.type,
        fileUrl: job.fileUrl,
        createdBy: userId,
      },
    });

    await this.audit.log({
      companyId,
      userId,
      action: AuditAction.USER_CREATED,
      entityName: "AIJob",
      entityId: job.id,
      details: { action: "AI_JOB_CREATED", type: input.type },
    });

    return job;
  }

  /**
   * Start executing an AI job.
   */
  async startJob(companyId: string, userId: string, jobId: string) {
    const job = await this.jobRepo.updateStatus(companyId, jobId, "RUNNING");

    await this.outboxRepo.create({
      companyId,
      eventType: "AIJobStarted",
      payload: {
        jobId,
        startedBy: userId,
        startedAt: new Date().toISOString(),
      },
    });

    return job;
  }

  /**
   * Update AI job progress percentage.
   */
  async updateProgress(companyId: string, jobId: string, progress: number) {
    return this.jobRepo.updateProgress(companyId, jobId, progress);
  }

  /**
   * Complete an AI job with execution results.
   */
  async completeJob(companyId: string, userId: string, jobId: string, result?: Record<string, any>) {
    const job = await this.jobRepo.completeJob(companyId, jobId, result);

    await this.outboxRepo.create({
      companyId,
      eventType: "AIJobCompleted",
      payload: {
        jobId,
        completedBy: userId,
        completedAt: new Date().toISOString(),
        resultSummary: result?.title || "Job Execution Finished",
      },
    });

    await this.audit.log({
      companyId,
      userId,
      action: AuditAction.USER_UPDATED,
      entityName: "AIJob",
      entityId: jobId,
      details: { action: "AI_JOB_COMPLETED" },
    });

    return job;
  }

  /**
   * Mark AI job as failed with error traceback.
   */
  async failJob(companyId: string, userId: string, jobId: string, error: string) {
    const job = await this.jobRepo.failJob(companyId, jobId, error);

    await this.outboxRepo.create({
      companyId,
      eventType: "AIJobFailed",
      payload: {
        jobId,
        error,
        failedAt: new Date().toISOString(),
      },
    });

    await this.audit.log({
      companyId,
      userId,
      action: AuditAction.USER_UPDATED,
      entityName: "AIJob",
      entityId: jobId,
      details: { action: "AI_JOB_FAILED", error },
    });

    return job;
  }

  /**
   * Cancel a pending or running AI job.
   */
  async cancelJob(companyId: string, userId: string, jobId: string) {
    const job = await this.jobRepo.cancelJob(companyId, jobId, userId);

    await this.audit.log({
      companyId,
      userId,
      action: AuditAction.USER_UPDATED,
      entityName: "AIJob",
      entityId: jobId,
      details: { action: "AI_JOB_CANCELLED" },
    });

    return job;
  }

  /**
   * Retry a failed or cancelled AI job.
   */
  async retryJob(companyId: string, userId: string, jobId: string) {
    const existing = await this.jobRepo.findById(companyId, jobId);
    if (!existing) throw new Error("AI Job not found or access denied.");

    const job = await this.jobRepo.updateStatus(companyId, jobId, "QUEUED");

    await this.audit.log({
      companyId,
      userId,
      action: AuditAction.USER_UPDATED,
      entityName: "AIJob",
      entityId: jobId,
      details: { action: "AI_JOB_RETRIED" },
    });

    return job;
  }

  /**
   * Query AI jobs with filters and pagination.
   */
  async findJobs(companyId: string, query?: AIJobQueryInput) {
    return this.jobRepo.findJobs(companyId, query);
  }

  /**
   * Get single job by ID.
   */
  async getJob(companyId: string, jobId: string) {
    return this.jobRepo.findById(companyId, jobId);
  }
}

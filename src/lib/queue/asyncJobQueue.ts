export type JobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "DEAD_LETTER";

export interface AsyncJob<T = any> {
  jobId: string;
  type: string;
  companyId: string;
  payload: T;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

class AsyncJobQueue {
  private jobs = new Map<string, AsyncJob>();

  createJob<T = any>(type: string, companyId: string, payload: T, maxAttempts = 3): AsyncJob<T> {
    const job: AsyncJob<T> = {
      jobId: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      companyId,
      payload,
      status: "PENDING",
      attempts: 0,
      maxAttempts,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.jobs.set(job.jobId, job);
    return job;
  }

  async processJob<T = any>(jobId: string, handler: (job: AsyncJob<T>) => Promise<void>): Promise<AsyncJob<T>> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    job.status = "PROCESSING";
    job.attempts += 1;
    job.updatedAt = new Date().toISOString();

    try {
      await handler(job);
      job.status = "COMPLETED";
    } catch (err: any) {
      job.error = err?.message || "Execution error";
      if (job.attempts >= job.maxAttempts) {
        job.status = "DEAD_LETTER";
      } else {
        job.status = "FAILED";
      }
    }

    job.updatedAt = new Date().toISOString();
    return job;
  }

  getJob(jobId: string, companyId: string): AsyncJob | null {
    const job = this.jobs.get(jobId);
    if (!job || job.companyId !== companyId) return null;
    return job;
  }

  getJobsByCompany(companyId: string): AsyncJob[] {
    return Array.from(this.jobs.values()).filter((j) => j.companyId === companyId);
  }

  clear(): void {
    this.jobs.clear();
  }
}

export const asyncJobQueue = new AsyncJobQueue();

export interface TenantAiJobRecord {
  jobId: string;
  companyId: string;
  actorUserId: string;
  requestId: string;
  provider: string;
  model: string;
  operation: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  prompt: string;
  output?: string;
  createdAt: string;
  updatedAt: string;
}

const aiJobStore = new Map<string, TenantAiJobRecord>();

export function createTenantAiJob(
  companyId: string,
  userId: string,
  requestId: string,
  provider: string,
  model: string,
  operation: string,
  prompt: string
): TenantAiJobRecord {
  const job: TenantAiJobRecord = {
    jobId: `ai_job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    companyId,
    actorUserId: userId,
    requestId,
    provider,
    model,
    operation,
    status: "PENDING",
    prompt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  aiJobStore.set(job.jobId, job);
  return job;
}

export function getTenantAiJob(jobId: string, requestingCompanyId: string): TenantAiJobRecord {
  const job = aiJobStore.get(jobId);
  if (!job || job.companyId !== requestingCompanyId) {
    throw new Error(`CROSS_TENANT_VIOLATION: AI job '${jobId}' not found or access denied for tenant '${requestingCompanyId}'.`);
  }
  return job;
}

export function clearAiJobStore(): void {
  aiJobStore.clear();
}

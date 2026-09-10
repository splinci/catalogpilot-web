export type SyncStatus = "PENDING" | "RUNNING" | "COMPLETED" | "PARTIALLY_COMPLETED" | "FAILED" | "CANCELLED";

export interface SyncJob {
  syncId: string;
  connectionId: string;
  companyId: string;
  provider: string;
  status: SyncStatus;
  startedAt: string;
  endedAt?: string;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  error?: string;
}

class SyncEngine {
  private syncJobs = new Map<string, SyncJob>();

  startSync(connectionId: string, companyId: string, provider: string): SyncJob {
    const job: SyncJob = {
      syncId: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      connectionId,
      companyId,
      provider,
      status: "RUNNING",
      startedAt: new Date().toISOString(),
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
    };

    this.syncJobs.set(job.syncId, job);
    return job;
  }

  completeSync(
    syncId: string,
    companyId: string,
    stats: { processed: number; created: number; updated: number; failed: number }
  ): SyncJob {
    const job = this.syncJobs.get(syncId);
    if (!job || job.companyId !== companyId) {
      throw new Error(`Sync job ${syncId} not found or unauthorized`);
    }

    job.recordsProcessed = stats.processed;
    job.recordsCreated = stats.created;
    job.recordsUpdated = stats.updated;
    job.recordsFailed = stats.failed;
    job.status = stats.failed > 0 ? "PARTIALLY_COMPLETED" : "COMPLETED";
    job.endedAt = new Date().toISOString();

    return job;
  }

  failSync(syncId: string, companyId: string, errorMessage: string): SyncJob {
    const job = this.syncJobs.get(syncId);
    if (!job || job.companyId !== companyId) {
      throw new Error(`Sync job ${syncId} not found or unauthorized`);
    }

    job.status = "FAILED";
    job.error = errorMessage;
    job.endedAt = new Date().toISOString();

    return job;
  }

  getTenantSyncJobs(companyId: string): SyncJob[] {
    return Array.from(this.syncJobs.values()).filter((j) => j.companyId === companyId);
  }

  clear(): void {
    this.syncJobs.clear();
  }
}

export const syncEngine = new SyncEngine();

export type BackupStatus =
  | "BACKUP_CREATED"
  | "BACKUP_VALIDATED"
  | "RESTORE_STARTED"
  | "RESTORE_COMPLETED"
  | "RESTORE_FAILED"
  | "BACKUP_EXPIRED";

export interface BackupRecord {
  backupId: string;
  companyId: string;
  createdAt: string;
  validatedAt?: string;
  recoveryPoint: string;
  integrityStatus: "PENDING" | "PASSED" | "FAILED";
  status: BackupStatus;
}

const backupStore = new Map<string, BackupRecord>();

export function createBackupRecord(companyId: string, recoveryPoint: string): BackupRecord {
  const record: BackupRecord = {
    backupId: `bkp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    companyId,
    createdAt: new Date().toISOString(),
    recoveryPoint,
    integrityStatus: "PENDING",
    status: "BACKUP_CREATED",
  };

  backupStore.set(record.backupId, record);
  return record;
}

export function validateBackupIntegrity(backupId: string, passed: boolean): BackupRecord {
  const record = backupStore.get(backupId);
  if (!record) throw new Error(`Backup '${backupId}' not found.`);

  record.integrityStatus = passed ? "PASSED" : "FAILED";
  record.status = passed ? "BACKUP_VALIDATED" : "RESTORE_FAILED";
  record.validatedAt = new Date().toISOString();

  return record;
}

export function validateBackupRecoveryReady(backupId: string): void {
  const record = backupStore.get(backupId);
  if (!record || record.integrityStatus !== "PASSED") {
    throw new Error(`BACKUP_NOT_RECOVERY_READY: Backup '${backupId}' has not passed integrity validation.`);
  }
}

export function clearBackupStore(): void {
  backupStore.clear();
}

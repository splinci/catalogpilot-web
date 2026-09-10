export type TenantLifecycleState = "ACTIVE" | "SUSPENDED" | "PENDING_DELETION" | "ARCHIVED" | "DELETED";

export interface TenantLifecycleRecord {
  companyId: string;
  state: TenantLifecycleState;
  requestedAt?: string;
  scheduledDeletionAt?: string;
  reason?: string;
  updatedAt: string;
}

const tenantStates = new Map<string, TenantLifecycleRecord>();

export function getTenantState(companyId: string): TenantLifecycleState {
  const record = tenantStates.get(companyId);
  return record ? record.state : "ACTIVE";
}

export function setTenantState(
  companyId: string,
  state: TenantLifecycleState,
  reason?: string
): TenantLifecycleRecord {
  const existing = tenantStates.get(companyId);
  const now = new Date().toISOString();

  let scheduledDeletionAt: string | undefined = existing?.scheduledDeletionAt;
  if (state === "PENDING_DELETION") {
    // 30-day grace period before hard purge
    scheduledDeletionAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  }

  const record: TenantLifecycleRecord = {
    companyId,
    state,
    requestedAt: existing?.requestedAt || now,
    scheduledDeletionAt,
    reason,
    updatedAt: now,
  };

  tenantStates.set(companyId, record);
  return record;
}

export function validateTenantMutationAllowed(companyId: string): void {
  const state = getTenantState(companyId);
  if (state !== "ACTIVE") {
    throw new Error(`Tenant mutations blocked. Current tenant lifecycle state is ${state}.`);
  }
}

export function clearTenantLifecycleStore(): void {
  tenantStates.clear();
}

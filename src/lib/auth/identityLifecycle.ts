export type UserLifecycleState = "PROVISIONED" | "ACTIVE" | "SUSPENDED" | "DEPROVISIONED";

export interface IdentityLifecycleRecord {
  userId: string;
  companyId: string;
  state: UserLifecycleState;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

const identityStore = new Map<string, IdentityLifecycleRecord>();

export function registerIdentityRecord(
  userId: string,
  companyId: string,
  state: UserLifecycleState = "ACTIVE"
): IdentityLifecycleRecord {
  const record: IdentityLifecycleRecord = {
    userId,
    companyId,
    state,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  identityStore.set(userId, record);
  return record;
}

export function updateIdentityState(userId: string, state: UserLifecycleState): IdentityLifecycleRecord {
  const record = identityStore.get(userId);
  if (!record) throw new Error(`Identity record for user '${userId}' not found.`);

  record.state = state;
  record.updatedAt = new Date().toISOString();
  return record;
}

export function validateIdentityActive(userId: string): void {
  const record = identityStore.get(userId);
  if (record && (record.state === "SUSPENDED" || record.state === "DEPROVISIONED")) {
    throw new Error(`AUTHENTICATION_BLOCKED: User identity '${userId}' is ${record.state}.`);
  }
}

export function deprovisionDormantAccounts(maxInactiveDays = 90): number {
  let count = 0;
  const cutoff = Date.now() - maxInactiveDays * 24 * 60 * 60 * 1000;

  for (const record of identityStore.values()) {
    if (record.state === "ACTIVE" && record.lastLoginAt) {
      const lastLoginTime = new Date(record.lastLoginAt).getTime();
      if (lastLoginTime < cutoff) {
        record.state = "SUSPENDED";
        record.updatedAt = new Date().toISOString();
        count++;
      }
    }
  }

  return count;
}

export function clearIdentityStore(): void {
  identityStore.clear();
}

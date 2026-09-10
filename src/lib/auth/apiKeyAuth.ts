import crypto from "crypto";

export type ApiKeyScope =
  | "catalog:read"
  | "catalog:write"
  | "inventory:read"
  | "inventory:write"
  | "orders:read"
  | "orders:write"
  | "webhooks:manage";

export interface TenantApiKey {
  id: string;
  companyId: string;
  name: string;
  prefix: string;
  keyHash: string;
  scopes: ApiKeyScope[];
  createdAt: string;
  expiresAt?: string;
  revoked: boolean;
  lastUsedAt?: string;
}

const apiKeyStore = new Map<string, TenantApiKey>();

export function hashApiKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

export function generateTenantApiKey(
  companyId: string,
  name: string,
  scopes: ApiKeyScope[],
  environment: "live" | "test" = "live"
): { rawKey: string; apiKeyRecord: TenantApiKey } {
  const randomSecret = crypto.randomBytes(24).toString("hex");
  const rawKey = `spl_${environment}_${randomSecret}`;
  const prefix = rawKey.substring(0, 14);
  const keyHash = hashApiKey(rawKey);

  const apiKeyRecord: TenantApiKey = {
    id: `key_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    companyId,
    name,
    prefix,
    keyHash,
    scopes,
    createdAt: new Date().toISOString(),
    revoked: false,
  };

  apiKeyStore.set(apiKeyRecord.id, apiKeyRecord);
  return { rawKey, apiKeyRecord };
}

export function authenticateApiKey(rawKey: string, requiredScope?: ApiKeyScope): TenantApiKey | null {
  if (!rawKey || !rawKey.startsWith("spl_")) return null;

  const targetHash = hashApiKey(rawKey);
  for (const record of apiKeyStore.values()) {
    if (record.keyHash === targetHash) {
      if (record.revoked) return null;
      if (record.expiresAt && new Date(record.expiresAt) < new Date()) return null;
      if (requiredScope && !record.scopes.includes(requiredScope)) return null;

      record.lastUsedAt = new Date().toISOString();
      return record;
    }
  }

  return null;
}

export function revokeApiKey(keyId: string, companyId: string): boolean {
  const record = apiKeyStore.get(keyId);
  if (!record || record.companyId !== companyId) return false;
  record.revoked = true;
  return true;
}

export function clearApiKeyStore(): void {
  apiKeyStore.clear();
}

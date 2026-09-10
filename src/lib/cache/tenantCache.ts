interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class TenantAwareCache {
  private store = new Map<string, CacheEntry<any>>();

  private buildKey(companyId: string, key: string): string {
    return `tenant:${companyId}:${key}`;
  }

  get<T>(companyId: string, key: string): T | null {
    const fullKey = this.buildKey(companyId, key);
    const entry = this.store.get(fullKey);

    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(fullKey);
      return null;
    }

    return entry.value as T;
  }

  set<T>(companyId: string, key: string, value: T, ttlSeconds: number = 60): void {
    const fullKey = this.buildKey(companyId, key);
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(fullKey, { value, expiresAt });
  }

  invalidate(companyId: string, key?: string): void {
    if (key) {
      this.store.delete(this.buildKey(companyId, key));
    } else {
      const prefix = `tenant:${companyId}:`;
      for (const k of this.store.keys()) {
        if (k.startsWith(prefix)) {
          this.store.delete(k);
        }
      }
    }
  }

  clear(): void {
    this.store.clear();
  }
}

export const tenantCache = new TenantAwareCache();

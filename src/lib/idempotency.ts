const idempotencyCache = new Map<string, { response: any; createdAt: number }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute window for duplicate request suppression

export function getCachedIdempotentResponse(key: string): any | null {
  const cached = idempotencyCache.get(key);
  if (!cached) return null;

  if (Date.now() - cached.createdAt > CACHE_TTL_MS) {
    idempotencyCache.delete(key);
    return null;
  }

  return cached.response;
}

export function setCachedIdempotentResponse(key: string, response: any): void {
  idempotencyCache.set(key, {
    response,
    createdAt: Date.now(),
  });
}

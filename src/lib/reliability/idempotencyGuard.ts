const processedIdempotencyKeys = new Map<string, { companyId: string; processedAt: string }>();

export function checkAndClaimIdempotencyKey(key: string, companyId: string): boolean {
  const scopedKey = `${companyId}:${key}`;
  if (processedIdempotencyKeys.has(scopedKey)) {
    return false; // Already processed
  }

  processedIdempotencyKeys.set(scopedKey, {
    companyId,
    processedAt: new Date().toISOString(),
  });
  return true;
}

export function clearIdempotencyKeys(): void {
  processedIdempotencyKeys.clear();
}

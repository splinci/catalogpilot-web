interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 30,
  windowMs: number = 60 * 1000
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    rateLimitMap.set(key, { count: 1, resetAt });
    return { success: true, limit: maxRequests, remaining: maxRequests - 1, reset: resetAt };
  }

  if (entry.count >= maxRequests) {
    return { success: false, limit: maxRequests, remaining: 0, reset: entry.resetAt };
  }

  entry.count += 1;
  return { success: true, limit: maxRequests, remaining: maxRequests - entry.count, reset: entry.resetAt };
}

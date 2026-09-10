const tenantTokenUsage = new Map<string, number>();
const MAX_TENANT_DAILY_TOKENS = 100000;

export function recordAiTokenUsage(companyId: string, tokensUsed: number): number {
  const current = tenantTokenUsage.get(companyId) || 0;
  const newTotal = current + tokensUsed;

  if (newTotal > MAX_TENANT_DAILY_TOKENS) {
    throw new Error(
      `AI_USAGE_LIMIT_EXCEEDED: Tenant '${companyId}' has exceeded maximum daily token allocation (${MAX_TENANT_DAILY_TOKENS}).`
    );
  }

  tenantTokenUsage.set(companyId, newTotal);
  return newTotal;
}

export function clearAiUsageStore(): void {
  tenantTokenUsage.clear();
}

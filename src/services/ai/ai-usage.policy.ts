/**
 * ============================================================================
 * Ondrio Commerce OS — AI Usage Policy Engine
 * ============================================================================
 * Specification Reference: M9-002 / BSD-009 / SAD-001
 * Business Rules: Quota tracking, rate limits, AI token cost estimation
 * ============================================================================
 */

export interface UsageQuotaCheck {
  isAllowed: boolean;
  currentDailyCount: number;
  maxDailyLimit: number;
  remainingQuota: number;
  reason?: string;
}

export class AIUsagePolicy {
  private readonly defaultMaxDailyJobs = 1000;
  private readonly costPer1000TokensUSD = 0.002; // $0.002 per 1k tokens standard tier

  /**
   * Track usage and return payload for logging/analytics.
   */
  trackUsage(companyId: string, jobType: string, tokensUsed: number) {
    const estimatedCost = this.estimateCost(tokensUsed);
    return {
      companyId,
      jobType,
      tokensUsed,
      estimatedCost,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Validate company daily usage quota limits.
   */
  validateQuota(currentDailyCount: number, maxDailyLimit = this.defaultMaxDailyJobs): UsageQuotaCheck {
    const isAllowed = currentDailyCount < maxDailyLimit;
    const remainingQuota = Math.max(0, maxDailyLimit - currentDailyCount);

    return {
      isAllowed,
      currentDailyCount,
      maxDailyLimit,
      remainingQuota,
      reason: isAllowed ? undefined : `Company daily AI execution limit of ${maxDailyLimit} jobs reached.`,
    };
  }

  /**
   * Validate daily execution limit for specific job type.
   */
  validateDailyLimit(currentJobTypeCount: number, maxLimit = 500): boolean {
    return currentJobTypeCount < maxLimit;
  }

  /**
   * Estimate token cost in USD based on token count.
   */
  estimateCost(tokensCount: number, ratePer1k = this.costPer1000TokensUSD): number {
    if (!tokensCount || tokensCount <= 0) return 0;
    const cost = (tokensCount / 1000) * ratePer1k;
    return Math.round(cost * 10000) / 10000; // Round to 4 decimal places
  }

  /**
   * Estimate job execution time in milliseconds.
   */
  estimateExecutionTime(jobType: string, itemQuantity = 1): number {
    let baseTimeMs = 1500;

    switch (jobType) {
      case "CONTENT_GENERATION":
        baseTimeMs = 2500;
        break;
      case "BULK_ENRICHMENT":
        baseTimeMs = 5000;
        break;
      case "DUPLICATE_DETECTION":
        baseTimeMs = 3500;
        break;
      default:
        baseTimeMs = 1500;
    }

    return baseTimeMs * itemQuantity;
  }
}

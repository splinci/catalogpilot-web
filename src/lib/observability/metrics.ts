export interface SLIMetrics {
  apiAvailabilityPercent: number;
  avgLatencyMs: number;
  errorRatePercent: number;
  errorBudgetRemainingPercent: number;
  totalRequests: number;
  failedRequests: number;
  authFailures: number;
  rateLimitHits: number;
  crossTenantBlocks: number;
}

class OperationalMetricsCollector {
  private totalRequests = 0;
  private failedRequests = 0;
  private totalLatencyMs = 0;
  private authFailures = 0;
  private rateLimitHits = 0;
  private crossTenantBlocks = 0;

  recordRequest(latencyMs: number, statusCode: number) {
    this.totalRequests += 1;
    this.totalLatencyMs += latencyMs;
    if (statusCode >= 500) {
      this.failedRequests += 1;
    }
  }

  recordAuthFailure() {
    this.authFailures += 1;
  }

  recordRateLimitHit() {
    this.rateLimitHits += 1;
  }

  recordCrossTenantBlock() {
    this.crossTenantBlocks += 1;
  }

  getSLIMetrics(): SLIMetrics {
    const total = Math.max(1, this.totalRequests);
    const availability = ((total - this.failedRequests) / total) * 100;
    const avgLatency = this.totalRequests > 0 ? this.totalLatencyMs / this.totalRequests : 0;
    const errorRate = (this.failedRequests / total) * 100;
    
    // Allowed 5xx error budget: 0.1% of requests
    const allowedErrors = Math.max(1, total * 0.001);
    const errorBudgetConsumed = (this.failedRequests / allowedErrors) * 100;
    const errorBudgetRemaining = Math.max(0, 100 - errorBudgetConsumed);

    return {
      apiAvailabilityPercent: Number(availability.toFixed(3)),
      avgLatencyMs: Number(avgLatency.toFixed(1)),
      errorRatePercent: Number(errorRate.toFixed(3)),
      errorBudgetRemainingPercent: Number(errorBudgetRemaining.toFixed(1)),
      totalRequests: this.totalRequests,
      failedRequests: this.failedRequests,
      authFailures: this.authFailures,
      rateLimitHits: this.rateLimitHits,
      crossTenantBlocks: this.crossTenantBlocks,
    };
  }

  reset() {
    this.totalRequests = 0;
    this.failedRequests = 0;
    this.totalLatencyMs = 0;
    this.authFailures = 0;
    this.rateLimitHits = 0;
    this.crossTenantBlocks = 0;
  }
}

export const metricsCollector = new OperationalMetricsCollector();

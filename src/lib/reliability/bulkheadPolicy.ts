export class BulkheadPolicy {
  private activeExecutions = new Map<string, number>();

  constructor(public readonly resourceName: string, private maxConcurrent: number = 5) {}

  acquireSlot(companyId: string): void {
    const key = `${companyId}:${this.resourceName}`;
    const current = this.activeExecutions.get(key) || 0;

    if (current >= this.maxConcurrent) {
      throw new Error(
        `BULKHEAD_LIMIT_EXCEEDED: Resource '${this.resourceName}' reached max concurrency (${this.maxConcurrent}) for tenant '${companyId}'.`
      );
    }

    this.activeExecutions.set(key, current + 1);
  }

  releaseSlot(companyId: string): void {
    const key = `${companyId}:${this.resourceName}`;
    const current = this.activeExecutions.get(key) || 0;
    if (current > 0) {
      this.activeExecutions.set(key, current - 1);
    }
  }

  getActiveCount(companyId: string): number {
    return this.activeExecutions.get(`${companyId}:${this.resourceName}`) || 0;
  }

  clear(): void {
    this.activeExecutions.clear();
  }
}

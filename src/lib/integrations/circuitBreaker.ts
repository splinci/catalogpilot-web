export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerOptions {
  failureThreshold: number; // Number of consecutive failures before opening circuit
  resetTimeoutMs: number;  // Time to wait before entering HALF_OPEN
}

export class IntegrationCircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failureCount = 0;
  private lastFailureTime = 0;

  constructor(
    public readonly providerName: string,
    private options: CircuitBreakerOptions = { failureThreshold: 3, resetTimeoutMs: 10000 }
  ) {}

  getState(): CircuitState {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.options.resetTimeoutMs) {
        this.state = "HALF_OPEN";
      }
    }
    return this.state;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const currentState = this.getState();

    if (currentState === "OPEN") {
      throw new Error(`CircuitBreaker for ${this.providerName} is OPEN. Provider call suppressed.`);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  private onFailure() {
    this.failureCount += 1;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = "OPEN";
    }
  }

  reset() {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }
}

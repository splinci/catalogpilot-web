export interface SloTarget {
  name: string;
  targetPercentage: number; // e.g. 99.9
  currentPercentage: number;
  errorBudgetRemainingPercentage: number;
  burnRate: number; // Consumption rate multiplier
}

export function evaluateSloStatus(
  totalRequests: number,
  failedRequests: number,
  targetPercentage = 99.9
): SloTarget {
  if (totalRequests === 0) {
    return {
      name: "API Availability SLO",
      targetPercentage,
      currentPercentage: 100,
      errorBudgetRemainingPercentage: 100,
      burnRate: 0,
    };
  }

  const successCount = totalRequests - failedRequests;
  const currentPercentage = parseFloat(((successCount / totalRequests) * 100).toFixed(3));

  const allowedErrorRate = 100 - targetPercentage; // e.g. 0.1%
  const actualErrorRate = parseFloat(((failedRequests / totalRequests) * 100).toFixed(3));

  const errorBudgetRemainingPercentage = Math.max(
    0,
    parseFloat(((allowedErrorRate - actualErrorRate) / allowedErrorRate * 100).toFixed(1))
  );

  const burnRate = actualErrorRate > 0 ? parseFloat((actualErrorRate / allowedErrorRate).toFixed(2)) : 0;

  return {
    name: "API Availability SLO",
    targetPercentage,
    currentPercentage,
    errorBudgetRemainingPercentage,
    burnRate,
  };
}

export function validateErrorBudgetDeploymentGate(errorBudgetRemainingPercentage: number): void {
  if (errorBudgetRemainingPercentage <= 0) {
    throw new Error(
      `DEPLOYMENT_BLOCKED_ERROR_BUDGET_EXHAUSTED: Error budget is exhausted (0%). Non-essential production deployments are frozen.`
    );
  }
}

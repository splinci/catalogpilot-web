export type ChaosFailureType =
  | "DATABASE_TIMEOUT"
  | "AI_PROVIDER_OUTAGE"
  | "INTEGRATION_FAILURE"
  | "WEBHOOK_DELIVERY_FAILURE"
  | "CACHE_FAILURE"
  | "WORKER_CRASH";

const activeFailureSimulations = new Set<ChaosFailureType>();

export function enableChaosFailure(failureType: ChaosFailureType): void {
  activeFailureSimulations.add(failureType);
}

export function disableChaosFailure(failureType: ChaosFailureType): void {
  activeFailureSimulations.delete(failureType);
}

export function clearChaosSimulations(): void {
  activeFailureSimulations.clear();
}

export function simulateChaosFailureIfActive(failureType: ChaosFailureType): void {
  if (activeFailureSimulations.has(failureType)) {
    throw new Error(`CHAOS_SIMULATION_ACTIVE: Simulated infrastructure failure '${failureType}'.`);
  }
}

export type DeploymentValidationState = "PENDING" | "VALIDATING" | "HEALTHY" | "DEGRADED" | "FAILED" | "ROLLED_BACK";

export interface InfrastructureDeploymentRecord {
  deploymentId: string;
  commitSha: string;
  releaseVersion: string;
  environment: string;
  status: DeploymentValidationState;
  timestamp: string;
}

const deploymentStore = new Map<string, InfrastructureDeploymentRecord>();

export function recordDeployment(commitSha: string, releaseVersion = "v1.0.0-GA"): InfrastructureDeploymentRecord {
  const record: InfrastructureDeploymentRecord = {
    deploymentId: `dep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    commitSha,
    releaseVersion,
    environment: "production",
    status: "HEALTHY",
    timestamp: new Date().toISOString(),
  };

  deploymentStore.set(record.deploymentId, record);
  return record;
}

export function triggerDeploymentRollback(deploymentId: string): InfrastructureDeploymentRecord {
  const record = deploymentStore.get(deploymentId);
  if (!record) throw new Error(`Deployment record '${deploymentId}' not found.`);

  record.status = "ROLLED_BACK";
  return record;
}

export function clearDeploymentStore(): void {
  deploymentStore.clear();
}

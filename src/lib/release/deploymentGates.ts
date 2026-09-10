export type DeploymentTarget = "DEVELOPMENT" | "STAGING" | "PRODUCTION";

export function validateDeploymentPromotion(
  target: DeploymentTarget,
  changeApproved: boolean,
  allTestsPassed: boolean,
  buildSuccess: boolean
): void {
  if (!allTestsPassed || !buildSuccess) {
    throw new Error(`PROMOTION_BLOCKED: Automated test or build release gate failed.`);
  }

  if (target === "PRODUCTION" && !changeApproved) {
    throw new Error(`PROMOTION_BLOCKED: Production deployment requires an APPROVED change record.`);
  }
}

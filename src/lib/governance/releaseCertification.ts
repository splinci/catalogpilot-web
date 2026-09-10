import { MASTER_GOVERNANCE_CONTROL_MATRIX } from "./governanceControlMatrix";

export type MasterReleaseClassification =
  | "CERTIFIED_FOR_GA"
  | "CERTIFIED_WITH_LIMITATIONS"
  | "NOT_CERTIFIED"
  | "BLOCKED";

export interface MasterReleaseCertificationResult {
  classification: MasterReleaseClassification;
  totalControlsCount: number;
  verifiedControlsCount: number;
  softwareVerificationStatus: "PASSED" | "FAILED";
  externalOperationalRequirementsPending: string[];
  blockingReasons: string[];
}

export function evaluateMasterReleaseCertification(
  testSuitePassed = true,
  productionBuildPassed = true,
  hasPendingCategoryCRequirements = true
): MasterReleaseCertificationResult {
  const blockingReasons: string[] = [];
  const externalOperationalRequirementsPending: string[] = [];

  if (!testSuitePassed) {
    blockingReasons.push("AUTOMATED_TEST_SUITE_FAILED: 100% test pass rate required.");
  }

  if (!productionBuildPassed) {
    blockingReasons.push("PRODUCTION_BUILD_FAILED: Next.js clean production build required.");
  }

  const unverifiedControls = MASTER_GOVERNANCE_CONTROL_MATRIX.filter(
    (c) => c.verificationStatus !== "VERIFIED" && c.certificationStatus !== "CERTIFIED"
  );

  if (unverifiedControls.length > 0) {
    blockingReasons.push(`UNVERIFIED_CONTROLS_DETECTED: ${unverifiedControls.length} governance controls remain unverified.`);
  }

  if (hasPendingCategoryCRequirements) {
    externalOperationalRequirementsPending.push("Real-world production database live backup and restore verification");
    externalOperationalRequirementsPending.push("Live production DNS / HTTPS SSL certificate binding");
    externalOperationalRequirementsPending.push("Production monitoring provider alerting webhooks binding");
  }

  let classification: MasterReleaseClassification = "CERTIFIED_FOR_GA";

  if (blockingReasons.length > 0) {
    classification = "BLOCKED";
  } else if (externalOperationalRequirementsPending.length > 0) {
    classification = "CERTIFIED_WITH_LIMITATIONS";
  }

  return {
    classification,
    totalControlsCount: MASTER_GOVERNANCE_CONTROL_MATRIX.length,
    verifiedControlsCount: MASTER_GOVERNANCE_CONTROL_MATRIX.length - unverifiedControls.length,
    softwareVerificationStatus: blockingReasons.length === 0 ? "PASSED" : "FAILED",
    externalOperationalRequirementsPending,
    blockingReasons,
  };
}

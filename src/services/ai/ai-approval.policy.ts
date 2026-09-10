/**
 * ============================================================================
 * Ondrio Commerce OS — AI Approval Policy Engine
 * ============================================================================
 * Specification Reference: M9-002 / BSD-009 / SAD-001
 * Business Rules: Confidence thresholds, auto-approval vs manual review
 * ============================================================================
 */

export interface ApprovalDecision {
  status: "AUTO_APPROVED" | "PENDING_REVIEW" | "REJECTED";
  reason: string;
  confidenceScore: number;
  thresholdUsed: number;
}

export class AIApprovalPolicy {
  private readonly defaultAutoApproveThreshold = 0.95;

  /**
   * Determine if an AI proposal requires manual human approval.
   */
  requiresApproval(confidenceScore: number, customThreshold = this.defaultAutoApproveThreshold): boolean {
    return confidenceScore < customThreshold;
  }

  /**
   * Evaluate confidence threshold and produce approval decision.
   */
  validateConfidenceThreshold(confidenceScore: number, customThreshold = this.defaultAutoApproveThreshold): ApprovalDecision {
    if (confidenceScore >= customThreshold) {
      return {
        status: "AUTO_APPROVED",
        reason: `Confidence score ${confidenceScore} meets or exceeds auto-approval threshold (${customThreshold}).`,
        confidenceScore,
        thresholdUsed: customThreshold,
      };
    }

    if (confidenceScore >= 0.6) {
      return {
        status: "PENDING_REVIEW",
        reason: `Confidence score ${confidenceScore} is below auto-approval threshold (${customThreshold}) but suitable for manual review.`,
        confidenceScore,
        thresholdUsed: customThreshold,
      };
    }

    return {
      status: "REJECTED",
      reason: `Confidence score ${confidenceScore} is below minimum acceptable quality threshold (0.6).`,
      confidenceScore,
      thresholdUsed: customThreshold,
    };
  }

  /**
   * Process manual human approval of an AI suggestion.
   */
  approveSuggestion(reviewerId: string, customApprovedValues?: Record<string, any>) {
    return {
      approved: true,
      reviewerId,
      approvedAt: new Date().toISOString(),
      overrideValues: customApprovedValues || null,
    };
  }

  /**
   * Process manual human rejection of an AI suggestion.
   */
  rejectSuggestion(reviewerId: string, reason: string) {
    return {
      approved: false,
      reviewerId,
      rejectedAt: new Date().toISOString(),
      reason: reason || "Rejected by catalog reviewer",
    };
  }

  /**
   * Validate human override payload against original AI suggestion.
   */
  validateHumanOverride(originalAiSuggestion: Record<string, any>, humanOverride: Record<string, any>): boolean {
    if (!humanOverride || Object.keys(humanOverride).length === 0) {
      return false;
    }
    return true;
  }
}

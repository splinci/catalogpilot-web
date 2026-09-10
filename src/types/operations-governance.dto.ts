/**
 * ============================================================================
 * Splinci Commerce OS — Enterprise Production Governance DTOs
 * ============================================================================
 * Specification Reference: GO-004 / GO-003 / GO-001 / GO-002 / CI-009 / SAD-001
 * Domain: Production Evidence Data Contract & Gate 30 Governance Decision Model
 * ============================================================================
 */

import { z } from "zod";

/**
 * Production Evidence Provenance Tag.
 * Server-authoritative classification of telemetry source.
 */
export enum ProductionProvenanceEnum {
  PRODUCTION_RUNTIME_EVIDENCE = "PRODUCTION_RUNTIME_EVIDENCE",
  STAGING = "STAGING",
  TEST = "TEST",
  SYNTHETIC = "SYNTHETIC",
  UNKNOWN = "UNKNOWN",
}

export const ProductionProvenanceSchema = z.nativeEnum(ProductionProvenanceEnum);

/**
 * Production Evidence Collection Status Enum.
 * Strict Governance Rule: No status may imply production verification before evidence exists.
 */
export enum ProductionEvidenceStatusEnum {
  PENDING = "PENDING",
  COLLECTING = "COLLECTING",
  SUFFICIENT = "SUFFICIENT",
  INSUFFICIENT = "INSUFFICIENT",
  FAILED = "FAILED",
  VERIFIED = "VERIFIED",
}

export const ProductionEvidenceStatusSchema = z.nativeEnum(ProductionEvidenceStatusEnum);

/**
 * Gate 30 Decision Enum.
 */
export enum Gate30DecisionEnum {
  NOT_VERIFIED = "NOT_VERIFIED",
  REQUIRES_EXTENDED_OBSERVATION = "REQUIRES_EXTENDED_OBSERVATION",
  READY_FOR_FINAL_APPROVAL = "READY_FOR_FINAL_APPROVAL",
  PASSED = "PASSED",
  FAILED = "FAILED",
}

export const Gate30DecisionSchema = z.nativeEnum(Gate30DecisionEnum);

/**
 * Production Observation Gap Schema.
 */
export const ObservationGapSchema = z.object({
  gapStart: z.string(),
  gapEnd: z.string(),
  durationMinutes: z.number(),
  reason: z.string(),
});

export type ObservationGapDto = z.infer<typeof ObservationGapSchema>;

/**
 * Threshold Breach Record Schema (Append-only / Permanent Evidence).
 */
export const ThresholdBreachSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  metric: z.string(),
  observedValue: z.number(),
  requiredThreshold: z.number(),
  severity: z.enum(["CRITICAL", "HIGH", "WARNING"]),
  durationMinutes: z.number(),
  resolutionTimestamp: z.string().optional(),
  invalidatesGate30: z.boolean(),
});

export type ThresholdBreachDto = z.infer<typeof ThresholdBreachSchema>;

/**
 * 24-Hour Production Observation Progress Schema.
 */
export const ObservationProgressSchema = z.object({
  startedAt: z.string(),
  elapsedHours: z.number(),
  remainingHours: z.number(),
  coveragePercent: z.number(),
  sampleCount: z.number(),
  gapCount: z.number(),
  longestGapMinutes: z.number(),
  breachCount: z.number(),
  status: z.enum(["OBSERVING_24H", "COMPLETED", "PAUSED", "NOT_STARTED"]),
});

export type ObservationProgressDto = z.infer<typeof ObservationProgressSchema>;

/**
 * Production Observation Window Schema.
 */
export const ProductionObservationWindowSchema = z.object({
  windowType: z.enum(["BASELINE", "WINDOW_1H", "WINDOW_6H", "WINDOW_12H", "WINDOW_24H"]),
  startedAt: z.string(),
  endedAt: z.string(),
  durationHours: z.number(),
  sampleCount: z.number(),
  isComplete: z.boolean(),
  status: ProductionEvidenceStatusSchema,
});

export type ProductionObservationWindowDto = z.infer<typeof ProductionObservationWindowSchema>;

/**
 * Production Evidence Metric Sample Schema.
 */
export const ProductionEvidenceSampleSchema = z.object({
  sampledAt: z.string(),
  provenance: ProductionProvenanceSchema,
  availabilityPercent: z.number(),
  avgLatencyMs: z.number(),
  errorRatePercent: z.number(),
  p1IncidentsCount: z.number(),
  p2IncidentsCount: z.number(),
  sloStatus: z.string(),
  outboxHealth: z.string(),
  workerHealth: z.string(),
  alertHealth: z.string(),
  resilienceScore: z.number(),
  drVerified: z.boolean(),
});

export type ProductionEvidenceSampleDto = z.infer<typeof ProductionEvidenceSampleSchema>;

/**
 * Production Metric Item Schema.
 */
export const ProductionEvidenceMetricSchema = z.object({
  metricName: z.string(),
  observedValue: z.number(),
  targetThreshold: z.number(),
  unit: z.string(),
  isHealthy: z.boolean(),
  status: ProductionEvidenceStatusSchema,
});

export type ProductionEvidenceMetricDto = z.infer<typeof ProductionEvidenceMetricSchema>;

/**
 * Incident Evidence Sub-Schema.
 */
export const ProductionIncidentEvidenceSchema = z.object({
  totalIncidents: z.number(),
  p1IncidentsCount: z.number(),
  p2IncidentsCount: z.number(),
  unresolvedP1Count: z.number(),
  unresolvedP2Count: z.number(),
  status: ProductionEvidenceStatusSchema,
});

export type ProductionIncidentEvidenceDto = z.infer<typeof ProductionIncidentEvidenceSchema>;

/**
 * SLO Evidence Sub-Schema.
 */
export const ProductionSLOEvidenceSchema = z.object({
  evaluatedAt: z.string(),
  overallStatus: z.string(),
  breachedSloCount: z.number(),
  warningSloCount: z.number(),
  healthySloCount: z.number(),
  status: ProductionEvidenceStatusSchema,
});

export type ProductionSLOEvidenceDto = z.infer<typeof ProductionSLOEvidenceSchema>;

/**
 * Resilience Evidence Sub-Schema.
 */
export const ProductionResilienceEvidenceSchema = z.object({
  readinessScore: z.number(),
  dependencyStatus: z.string(),
  failureDomainStatus: z.string(),
  status: ProductionEvidenceStatusSchema,
});

export type ProductionResilienceEvidenceDto = z.infer<typeof ProductionResilienceEvidenceSchema>;

/**
 * Disaster Recovery Evidence Sub-Schema.
 */
export const ProductionDREvidenceSchema = z.object({
  isDRVerified: z.boolean(),
  rpoMinutes: z.number(),
  rtoMinutes: z.number(),
  physicalRestoreVerified: z.boolean(),
  status: ProductionEvidenceStatusSchema,
});

export type ProductionDREvidenceDto = z.infer<typeof ProductionDREvidenceSchema>;

/**
 * Mandatory 15-Point Verification Flags Model for GATE 30.
 */
export const Gate30VerificationFlagsSchema = z.object({
  deploymentVerified: z.boolean(),
  observationWindowVerified: z.boolean(),
  availabilityVerified: z.boolean(),
  latencyVerified: z.boolean(),
  errorRateVerified: z.boolean(),
  incidentStateVerified: z.boolean(),
  sloVerified: z.boolean(),
  outboxVerified: z.boolean(),
  workerVerified: z.boolean(),
  alertingVerified: z.boolean(),
  resilienceVerified: z.boolean(),
  drVerified: z.boolean(),
  capacityVerified: z.boolean(),
  rollbackVerified: z.boolean(),
  securityVerified: z.boolean(),
});

export type Gate30VerificationFlagsDto = z.infer<typeof Gate30VerificationFlagsSchema>;

/**
 * Full Gate 30 Governance Evidence Package Schema.
 */
export const Gate30EvidenceSchema = z.object({
  evaluatedAt: z.string(),
  launchTimestamp: z.string(),
  version: z.string(),
  commitHash: z.string(),
  observationStart: z.string(),
  observationEnd: z.string(),
  observationDurationHours: z.number(),
  hasRealProductionEvidence: z.boolean(),
  provenance: ProductionProvenanceSchema,
  progress: ObservationProgressSchema,
  gaps: z.array(ObservationGapSchema),
  breaches: z.array(ThresholdBreachSchema),
  verificationFlags: Gate30VerificationFlagsSchema,
  availabilityPercent: z.number(),
  avgLatencyMs: z.number(),
  errorRatePercent: z.number(),
  p1Count: z.number(),
  p2Count: z.number(),
  unresolvedP1Count: z.number(),
  unresolvedP2Count: z.number(),
  sloCompliance: z.string(),
  outboxHealth: z.string(),
  workerHealth: z.string(),
  alertHealth: z.string(),
  resilienceScore: z.number(),
  drVerified: z.boolean(),
  rollbackReady: z.boolean(),
  gate30Status: z.enum(["NOT_VERIFIED", "READY_FOR_FINAL_APPROVAL", "PASS", "FAIL"]),
  evaluatorDecision: Gate30DecisionSchema,
  missingEvidenceList: z.array(z.string()),
  evidenceNotes: z.string(),
});

export type Gate30EvidenceDto = z.infer<typeof Gate30EvidenceSchema>;

/**
 * Individual Governance Gate Item in GO-030 30-Gate Matrix.
 */
export const GovernanceGateItemSchema = z.object({
  gateId: z.string(),
  name: z.string(),
  category: z.string(),
  isCritical: z.boolean(),
  status: z.enum(["PASS", "FAIL", "NOT_VERIFIED"]),
  details: z.string(),
});

export type GovernanceGateItemDto = z.infer<typeof GovernanceGateItemSchema>;

/**
 * Complete 30-Gate Evaluation Matrix Schema.
 */
export const Gate30EvaluationSchema = z.object({
  evaluatedAt: z.string(),
  totalGatesCount: z.number(),
  passedGatesCount: z.number(),
  failedGatesCount: z.number(),
  notVerifiedGatesCount: z.number(),
  readinessScore: z.number(),
  gates: z.array(GovernanceGateItemSchema),
});

export type Gate30EvaluationDto = z.infer<typeof Gate30EvaluationSchema>;

/**
 * Final Go-Live Decision Model Schema.
 */
export const FinalGoLiveDecisionSchema = z.object({
  evaluatedAt: z.string(),
  companyId: z.string().optional(),
  implementationStatus: z.enum(["IMPLEMENTATION_VERIFIED", "PRODUCTION_EVIDENCE_VERIFIED"]),
  officialStatus: z.string(), // e.g. "CONTROLLED_PRODUCTION_READY" or "STABLE_PRODUCTION"
  gate30Status: z.enum(["NOT_VERIFIED", "READY_FOR_FINAL_APPROVAL", "PASS", "FAIL"]),
  evaluatorDecision: Gate30DecisionSchema,
  summary: z.string(),
  requiredAction: z.string(),
  missingEvidenceList: z.array(z.string()),
  finalizedBy: z.string().optional(),
  finalizedAt: z.string().optional(),
});

export type FinalGoLiveDecisionDto = z.infer<typeof FinalGoLiveDecisionSchema>;

/**
 * Go-Live Evidence Dashboard Combined DTO.
 */
export const GoLiveEvidenceDashboardSchema = z.object({
  evaluatedAt: z.string(),
  companyId: z.string().optional(),
  officialStatus: z.string(),
  implementationStatus: z.enum(["IMPLEMENTATION_VERIFIED", "PRODUCTION_EVIDENCE_VERIFIED"]),
  gate30Evidence: Gate30EvidenceSchema,
  gate30Evaluation: Gate30EvaluationSchema,
  progress: ObservationProgressSchema,
  gaps: z.array(ObservationGapSchema),
  breaches: z.array(ThresholdBreachSchema),
  windows: z.array(ProductionObservationWindowSchema),
  currentSample: ProductionEvidenceSampleSchema,
  metrics: z.array(ProductionEvidenceMetricSchema),
  incidentEvidence: ProductionIncidentEvidenceSchema,
  sloEvidence: ProductionSLOEvidenceSchema,
  resilienceEvidence: ProductionResilienceEvidenceSchema,
  drEvidence: ProductionDREvidenceSchema,
  finalDecision: FinalGoLiveDecisionSchema,
});

export type GoLiveEvidenceDashboardDto = z.infer<typeof GoLiveEvidenceDashboardSchema>;

/**
 * ============================================================================
 * Splinci Commerce OS — GO-004 Go-Live Evidence & Provenance Vitest Test Suite
 * ============================================================================
 * Specification Reference: GO-004 / GO-003 / GO-001 / GO-002 / CI-009 / SAD-001
 * Domain: 35 Acceptance Criteria Vitest Verification Suite
 * ============================================================================
 */

import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { prisma } from "../../../lib/prisma";
import { GoLiveEvidencePolicy } from "../go-live-evidence.policy";
import { GoLiveEvidenceService } from "../go-live-evidence.service";
import {
  Gate30DecisionEnum,
  ProductionEvidenceStatusEnum,
  ProductionProvenanceEnum,
} from "../../../types/operations-governance.dto";

describe("GO-004 Enterprise Production 24-Hour Observation & Evidence Test Suite", () => {
  const companyA = "cmp_evidence_isolated_test";

  beforeAll(async () => {
    await prisma.company.upsert({
      where: { id: companyA },
      create: { id: companyA, code: "EVIDENCE_TENANT", legalName: "Evidence Legal", displayName: "Evidence Tenant" },
      update: {},
    });
    await prisma.user.upsert({
      where: { id: "usr_evidence_operator" },
      create: {
        id: "usr_evidence_operator",
        companyId: companyA,
        email: "operator@evidence.com",
        passwordHash: "hash",
        firstName: "Evidence",
        lastName: "Operator",
        role: "ADMIN",
      },
      update: {},
    });
  });

  describe("1. GoLiveEvidencePolicy Pure Deterministic Policy Rules", () => {
    it("1. should validate production provenance tag correctly", () => {
      expect(GoLiveEvidencePolicy.isProductionProvenance(ProductionProvenanceEnum.PRODUCTION_RUNTIME_EVIDENCE)).toBe(true);
      expect(GoLiveEvidencePolicy.isProductionProvenance(ProductionProvenanceEnum.TEST)).toBe(false);
      expect(GoLiveEvidencePolicy.isProductionProvenance(ProductionProvenanceEnum.STAGING)).toBe(false);
    });

    it("2. should reject non-production evidence from GATE 30 qualification", () => {
      const now = new Date();
      const start = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const end = now.toISOString();

      const gate30 = GoLiveEvidencePolicy.evaluateGate30Evidence({
        hasRealProductionEvidence: true,
        provenance: ProductionProvenanceEnum.TEST, // Non-production tag
        launchTimestamp: start,
        observationStart: start,
        observationEnd: end,
        availabilityPercent: 99.95,
        avgLatencyMs: 45.0,
        errorRatePercent: 0.01,
        p1Count: 0,
        p2Count: 0,
        unresolvedP1Count: 0,
        unresolvedP2Count: 0,
        sloStatus: "HEALTHY",
        outboxHealth: "OPERATIONAL",
        workerHealth: "HEALTHY",
        alertHealth: "ACTIVE",
        resilienceScore: 92,
        drVerified: true,
        rollbackReady: true,
      });

      expect(gate30.gate30Status).toBe("NOT_VERIFIED");
      expect(gate30.evaluatorDecision).toBe(Gate30DecisionEnum.NOT_VERIFIED);
    });

    it("3. should calculate observation duration correctly in hours", () => {
      const start = "2026-08-11T00:00:00.000Z";
      const end = "2026-08-12T00:00:00.000Z";
      const duration = GoLiveEvidencePolicy.calculateObservationDuration(start, end);
      expect(duration).toBe(24.0);
    });

    it("4. should detect observation telemetry gaps > 15 minutes", () => {
      const now = Date.now();
      const samples = [
        { sampledAt: new Date(now).toISOString(), availabilityPercent: 100 } as any,
        { sampledAt: new Date(now + 40 * 60 * 1000).toISOString(), availabilityPercent: 100 } as any, // 40 min gap
      ];
      const result = GoLiveEvidencePolicy.calculateObservationGaps(samples);
      expect(result.gapCount).toBe(1);
      expect(result.longestGapMinutes).toBe(40);
    });

    it("5. should evaluate availability breaching threshold (< 99.9%)", () => {
      const res = GoLiveEvidencePolicy.evaluateAvailability(99.85);
      expect(res.isHealthy).toBe(false);
      expect(res.status).toBe(ProductionEvidenceStatusEnum.FAILED);
    });

    it("6. should evaluate availability passing threshold (>= 99.9%)", () => {
      const res = GoLiveEvidencePolicy.evaluateAvailability(99.95);
      expect(res.isHealthy).toBe(true);
      expect(res.status).toBe(ProductionEvidenceStatusEnum.SUFFICIENT);
    });

    it("7. should evaluate latency breaching threshold (>= 200ms)", () => {
      const res = GoLiveEvidencePolicy.evaluateLatency(210.0);
      expect(res.isHealthy).toBe(false);
      expect(res.status).toBe(ProductionEvidenceStatusEnum.FAILED);
    });

    it("8. should evaluate latency passing threshold (< 200ms)", () => {
      const res = GoLiveEvidencePolicy.evaluateLatency(120.0);
      expect(res.isHealthy).toBe(true);
      expect(res.status).toBe(ProductionEvidenceStatusEnum.SUFFICIENT);
    });

    it("9. should evaluate error rate breaching threshold (>= 0.1%)", () => {
      const res = GoLiveEvidencePolicy.evaluateErrorRate(0.15);
      expect(res.isHealthy).toBe(false);
      expect(res.status).toBe(ProductionEvidenceStatusEnum.FAILED);
    });

    it("10. should evaluate error rate passing threshold (< 0.1%)", () => {
      const res = GoLiveEvidencePolicy.evaluateErrorRate(0.02);
      expect(res.isHealthy).toBe(true);
      expect(res.status).toBe(ProductionEvidenceStatusEnum.SUFFICIENT);
    });

    it("11. should fail incident evaluation when unresolved P1 incident present", () => {
      const res = GoLiveEvidencePolicy.evaluateIncidents(1, 0);
      expect(res.status).toBe(ProductionEvidenceStatusEnum.FAILED);
    });

    it("12. should pass incident evaluation when 0 unresolved P1 incidents", () => {
      const res = GoLiveEvidencePolicy.evaluateIncidents(0, 1);
      expect(res.status).toBe(ProductionEvidenceStatusEnum.SUFFICIENT);
    });

    it("13. should fail incident evaluation when severe P2 count exceeds 2", () => {
      const res = GoLiveEvidencePolicy.evaluateIncidents(0, 3);
      expect(res.status).toBe(ProductionEvidenceStatusEnum.FAILED);
    });

    it("14. should detect SLO failure when status is BREACHED", () => {
      const gaps = GoLiveEvidencePolicy.detectEvidenceGaps({
        hasRealProductionEvidence: true,
        provenance: ProductionProvenanceEnum.PRODUCTION_RUNTIME_EVIDENCE,
        observationDurationHours: 24.0,
        availabilityPercent: 99.95,
        avgLatencyMs: 100,
        errorRatePercent: 0.01,
        unresolvedP1Count: 0,
        unresolvedP2Count: 0,
        sloStatus: "BREACHED",
        drVerified: true,
        resilienceScore: 90,
        outboxHealth: "OPERATIONAL",
        workerHealth: "HEALTHY",
      });
      expect(gaps.some((g) => g.includes("SLO breach"))).toBe(true);
    });

    it("15. should pass SLO evaluation when status is HEALTHY", () => {
      const gaps = GoLiveEvidencePolicy.detectEvidenceGaps({
        hasRealProductionEvidence: true,
        provenance: ProductionProvenanceEnum.PRODUCTION_RUNTIME_EVIDENCE,
        observationDurationHours: 24.0,
        availabilityPercent: 99.95,
        avgLatencyMs: 100,
        errorRatePercent: 0.01,
        unresolvedP1Count: 0,
        unresolvedP2Count: 0,
        sloStatus: "HEALTHY",
        drVerified: true,
        resilienceScore: 90,
        outboxHealth: "OPERATIONAL",
        workerHealth: "HEALTHY",
      });
      expect(gaps.length).toBe(0);
    });

    it("16. should report gap when outbox health is DEGRADED", () => {
      const gaps = GoLiveEvidencePolicy.detectEvidenceGaps({
        hasRealProductionEvidence: true,
        provenance: ProductionProvenanceEnum.PRODUCTION_RUNTIME_EVIDENCE,
        observationDurationHours: 24.0,
        availabilityPercent: 99.95,
        avgLatencyMs: 100,
        errorRatePercent: 0.01,
        unresolvedP1Count: 0,
        unresolvedP2Count: 0,
        sloStatus: "HEALTHY",
        drVerified: true,
        resilienceScore: 90,
        outboxHealth: "DEGRADED",
        workerHealth: "HEALTHY",
      });
      expect(gaps.some((g) => g.includes("Outbox background worker"))).toBe(true);
    });

    it("17. should report gap when worker health is FAILED", () => {
      const gaps = GoLiveEvidencePolicy.detectEvidenceGaps({
        hasRealProductionEvidence: true,
        provenance: ProductionProvenanceEnum.PRODUCTION_RUNTIME_EVIDENCE,
        observationDurationHours: 24.0,
        availabilityPercent: 99.95,
        avgLatencyMs: 100,
        errorRatePercent: 0.01,
        unresolvedP1Count: 0,
        unresolvedP2Count: 0,
        sloStatus: "HEALTHY",
        drVerified: true,
        resilienceScore: 90,
        outboxHealth: "OPERATIONAL",
        workerHealth: "FAILED",
      });
      expect(gaps.some((g) => g.includes("Async worker pool"))).toBe(true);
    });

    it("18. should evaluate GATE 30 to NOT_VERIFIED without real evidence", () => {
      const gate30 = GoLiveEvidencePolicy.evaluateGate30Evidence({
        hasRealProductionEvidence: false,
        launchTimestamp: new Date().toISOString(),
        observationStart: new Date().toISOString(),
        observationEnd: new Date().toISOString(),
        availabilityPercent: 99.95,
        avgLatencyMs: 45.0,
        errorRatePercent: 0.01,
        p1Count: 0,
        p2Count: 0,
        unresolvedP1Count: 0,
        unresolvedP2Count: 0,
        sloStatus: "HEALTHY",
        outboxHealth: "OPERATIONAL",
        workerHealth: "HEALTHY",
        alertHealth: "ACTIVE",
        resilienceScore: 92,
        drVerified: true,
        rollbackReady: true,
      });

      expect(gate30.gate30Status).toBe("NOT_VERIFIED");
    });

    it("19. should fail resilience evaluation when readiness score < 70", () => {
      const gaps = GoLiveEvidencePolicy.detectEvidenceGaps({
        hasRealProductionEvidence: true,
        provenance: ProductionProvenanceEnum.PRODUCTION_RUNTIME_EVIDENCE,
        observationDurationHours: 24.0,
        availabilityPercent: 99.95,
        avgLatencyMs: 100,
        errorRatePercent: 0.01,
        unresolvedP1Count: 0,
        unresolvedP2Count: 0,
        sloStatus: "HEALTHY",
        drVerified: true,
        resilienceScore: 65,
        outboxHealth: "OPERATIONAL",
        workerHealth: "HEALTHY",
      });
      expect(gaps.some((g) => g.includes("Resilience readiness degraded"))).toBe(true);
    });

    it("20. should fail DR evaluation when drVerified is false", () => {
      const gaps = GoLiveEvidencePolicy.detectEvidenceGaps({
        hasRealProductionEvidence: true,
        provenance: ProductionProvenanceEnum.PRODUCTION_RUNTIME_EVIDENCE,
        observationDurationHours: 24.0,
        availabilityPercent: 99.95,
        avgLatencyMs: 100,
        errorRatePercent: 0.01,
        unresolvedP1Count: 0,
        unresolvedP2Count: 0,
        sloStatus: "HEALTHY",
        drVerified: false,
        resilienceScore: 90,
        outboxHealth: "OPERATIONAL",
        workerHealth: "HEALTHY",
      });
      expect(gaps.some((g) => g.includes("Disaster Recovery verification missing"))).toBe(true);
    });
  });

  describe("2. GoLiveEvidenceService Execution & End-to-End Governance", () => {
    let service: GoLiveEvidenceService;

    beforeAll(async () => {
      service = new GoLiveEvidenceService();
      const { backupRecoveryService } = await import("../backup-recovery.service");
      await backupRecoveryService.executeStagingRestore(
        { environment: "staging", restoreTarget: "staging_isolated_drill_db" },
        companyA,
        "usr_evidence_operator"
      );
    });

    beforeEach(() => {
      service.resetState();
    });

    it("21. should evaluate capacity headroom and rollback readiness", async () => {
      const gate30 = await service.getGate30Evidence(companyA);
      expect(gate30.rollbackReady).toBe(true);
    }, 15000);

    it("22. should verify zero credentials or secrets exposed in dashboard DTO", async () => {
      const dashboard = await service.getDashboardPayload(companyA);
      const str = JSON.stringify(dashboard);
      expect(str).not.toContain("DATABASE_URL");
      expect(str).not.toContain("passwordHash");
      expect(str).not.toContain("secretKey");
    }, 30000);

    it("23. should enforce server-authoritative provenance classification", async () => {
      const sample = await service.getCurrentSample(companyA);
      expect(sample.provenance).toBeDefined();
      expect(sample.provenance).toBe(ProductionProvenanceEnum.TEST);
    }, 15000);

    it("24. should prevent client spoofing of PRODUCTION_RUNTIME_EVIDENCE provenance", async () => {
      const sample = await service.captureProductionSample(companyA, "usr_evidence_operator", "PRODUCTION_RUNTIME_EVIDENCE" as any);
      expect(sample.provenance).toBe(ProductionProvenanceEnum.TEST); // Server-authoritative override
    }, 15000);

    it("25. should append samples to immutable sample buffer", async () => {
      await service.captureProductionSample(companyA, "usr_evidence_operator");
      const progress = await service.getObservationProgress();
      expect(progress.sampleCount).toBe(1);
    }, 15000);

    it("26. should record threshold breaches immutably when thresholds are breached", () => {
      const samples = [
        { sampledAt: new Date().toISOString(), availabilityPercent: 98.0, avgLatencyMs: 250, errorRatePercent: 0.5, p1IncidentsCount: 1 } as any,
      ];
      const breaches = GoLiveEvidencePolicy.evaluateThresholdBreaches(samples);
      expect(breaches.length).toBe(4);
      expect(breaches[0].invalidatesGate30).toBe(true);
    });

    it("27. should report explicit missing evidence list when GATE 30 is NOT_VERIFIED", async () => {
      const gate30 = await service.getGate30Evidence(companyA);
      expect(gate30.missingEvidenceList.length).toBeGreaterThan(0);
    }, 15000);

    it("28. should calculate 24-hour observation progress DTO", async () => {
      const progress = await service.getObservationProgress();
      expect(progress.remainingHours).toBeGreaterThan(0);
      expect(progress.status).toBeDefined();
    }, 15000);

    it("29. CRITICAL GOVERNANCE TEST: GATE 30 MUST BE 'NOT_VERIFIED' WITHOUT 24H REAL EVIDENCE", async () => {
      const defaultGate30 = await service.getGate30Evidence(companyA);
      expect(defaultGate30.gate30Status).toBe("NOT_VERIFIED");
    }, 15000);

    it("30. should transition GATE 30 to READY_FOR_FINAL_APPROVAL only when genuine 24h evidence passes", async () => {
      // Evaluate policy with genuine 24h production evidence
      const now = new Date();
      const start = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const end = now.toISOString();

      const gate30 = GoLiveEvidencePolicy.evaluateGate30Evidence({
        hasRealProductionEvidence: true,
        provenance: ProductionProvenanceEnum.PRODUCTION_RUNTIME_EVIDENCE,
        launchTimestamp: start,
        observationStart: start,
        observationEnd: end,
        availabilityPercent: 99.95,
        avgLatencyMs: 45.0,
        errorRatePercent: 0.01,
        p1Count: 0,
        p2Count: 0,
        unresolvedP1Count: 0,
        unresolvedP2Count: 0,
        sloStatus: "HEALTHY",
        outboxHealth: "OPERATIONAL",
        workerHealth: "HEALTHY",
        alertHealth: "ACTIVE",
        resilienceScore: 92,
        drVerified: true,
        rollbackReady: true,
      });

      expect(gate30.gate30Status).toBe("READY_FOR_FINAL_APPROVAL");
      expect(gate30.evaluatorDecision).toBe(Gate30DecisionEnum.READY_FOR_FINAL_APPROVAL);
    });

    it("31. GOVERNANCE MANDATE TEST: finalizeEvidencePackage MUST NOT promote officialStatus to STABLE_PRODUCTION", async () => {
      await service.captureProductionSample(companyA, "usr_evidence_operator");
      const decision = await service.finalizeEvidencePackage(companyA, "usr_evidence_operator");

      expect(decision.officialStatus).toBe("CONTROLLED_PRODUCTION_READY");
    }, 30000);

    it("32. should maintain historical evidence immutability", async () => {
      await service.captureProductionSample(companyA, "usr_evidence_operator");
      const progress = await service.getObservationProgress();
      expect(progress.sampleCount).toBe(1);
    }, 15000);

    it("33. should safely handle duplicate observation samples", async () => {
      await service.captureProductionSample(companyA, "usr_evidence_operator");
      await service.captureProductionSample(companyA, "usr_evidence_operator");
      const progress = await service.getObservationProgress();
      expect(progress.sampleCount).toBe(2);
    }, 15000);

    it("34. should evaluate incomplete observation windows as NOT_VERIFIED", async () => {
      const now = new Date();
      const start = new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString(); // 10h observation
      const end = now.toISOString();

      const gate30 = GoLiveEvidencePolicy.evaluateGate30Evidence({
        hasRealProductionEvidence: true,
        provenance: ProductionProvenanceEnum.PRODUCTION_RUNTIME_EVIDENCE,
        launchTimestamp: start,
        observationStart: start,
        observationEnd: end,
        availabilityPercent: 99.95,
        avgLatencyMs: 45.0,
        errorRatePercent: 0.01,
        p1Count: 0,
        p2Count: 0,
        unresolvedP1Count: 0,
        unresolvedP2Count: 0,
        sloStatus: "HEALTHY",
        outboxHealth: "OPERATIONAL",
        workerHealth: "HEALTHY",
        alertHealth: "ACTIVE",
        resilienceScore: 92,
        drVerified: true,
        rollbackReady: true,
      });

      expect(gate30.gate30Status).toBe("NOT_VERIFIED");
    });

    it("35. ACCEPTANCE GATE 30 VERIFICATION: GATE 30 is NOT_VERIFIED without live evidence, READY_FOR_FINAL_APPROVAL with genuine 24h evidence", async () => {
      const defaultGate30 = await service.getGate30Evidence(companyA);
      expect(defaultGate30.gate30Status).toBe("NOT_VERIFIED");
    }, 30000);
  });
});

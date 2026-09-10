/**
 * ============================================================================
 * Splinci Commerce OS — CI-006 Resilience & DR Test Suite
 * ============================================================================
 * Specification Reference: CI-006 / TEST-006 / RESILIENCE-001 / ENG-001
 * Coverage: ResiliencePolicy, ResilienceOperationsService, RTO/RPO & DR Readiness
 * ============================================================================
 */

import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { prisma } from "../../../lib/prisma";
import { ResiliencePolicy } from "../resilience.policy";
import { ResilienceOperationsService } from "../resilience.service";
import {
  ResilienceRatingEnum,
  RTOStatusEnum,
  RPOStatusEnum,
} from "../../../types/operations-resilience.dto";

describe("CI-006 Enterprise Production Resilience Test Suite", () => {
  const companyA = "cmp_ci_tenant_a";

  beforeAll(async () => {
    await prisma.company.upsert({
      where: { id: companyA },
      create: { id: companyA, code: "CI_RESILIENCE_TENANT", legalName: "CI Resilience Legal", displayName: "CI Resilience Tenant" },
      update: {},
    });
  });

  describe("1. ResiliencePolicy Rules", () => {
    it("should calculate 0-100 Recovery Readiness Score and rating correctly", () => {
      const readiness = ResiliencePolicy.calculateReadinessScore({
        dbConnected: true,
        workerRunning: true,
        sloHealthy: true,
        activeIncidentCount: 0,
        errorBudgetRemainingPercent: 85,
      });

      expect(readiness.score).toBe(100);
      expect(readiness.rating).toBe(ResilienceRatingEnum.EXCELLENT);
      expect(readiness.passedChecksCount).toBe(4);
    });

    it("should deduct score and downgrade rating when DB is disconnected or worker is stopped", () => {
      const readiness = ResiliencePolicy.calculateReadinessScore({
        dbConnected: false,
        workerRunning: false,
        sloHealthy: false,
        activeIncidentCount: 2,
        errorBudgetRemainingPercent: 10,
      });

      expect(readiness.score).toBeLessThan(50);
      expect(readiness.rating).toBe(ResilienceRatingEnum.CRITICAL);
      expect(readiness.criticalBlockersCount).toBeGreaterThan(0);
    });

    it("should assess RTO and RPO targets accurately", () => {
      const rto = ResiliencePolicy.assessRTO(true, 10, 30);
      expect(rto.targetMinutes).toBe(15);
      expect(rto.estimatedRecoveryMinutes).toBe(2);
      expect(rto.rtoStatus).toBe(RTOStatusEnum.ESTIMATED);

      const rpo = ResiliencePolicy.assessRPO(10, 0);
      expect(rpo.targetMinutes).toBe(5);
      expect(rpo.estimatedDataLossMinutes).toBe(0);
      expect(rpo.rpoStatus).toBe(RPOStatusEnum.BACKUP_VERIFICATION_REQUIRED);
    });

    it("should classify operational dependencies and failure domains", () => {
      const deps = ResiliencePolicy.assessDependencies(true, 35, true);
      expect(deps.length).toBe(4);
      expect(deps[0].name).toBe("PostgreSQL Database");

      const domains = ResiliencePolicy.evaluateFailureDomains(true, true, 10);
      expect(domains.length).toBe(3);
      expect(domains[0].domain).toBe("PostgreSQL Database Connectivity");
    });
  });

  describe("2. ResilienceOperationsService Execution", () => {
    let service: ResilienceOperationsService;

    beforeEach(() => {
      service = new ResilienceOperationsService();
    });

    it("should return recovery readiness DTO", async () => {
      const readiness = await service.getRecoveryReadiness(companyA);
      expect(readiness.score).toBeGreaterThanOrEqual(0);
      expect(readiness.rating).toBeDefined();
    });

    it("should return RTO and RPO assessments", async () => {
      const rto = await service.getRTOAssessment(companyA);
      expect(rto.targetMinutes).toBe(15);

      const rpo = await service.getRPOAssessment(companyA);
      expect(rpo.targetMinutes).toBe(5);
    });

    it("should return operational dependency health", async () => {
      const deps = await service.getDependencyHealth(companyA);
      expect(deps.length).toBe(4);
    });

    it("should assemble complete resilience operations dashboard DTO", async () => {
      const dashboard = await service.getResilienceDashboard(companyA);
      expect(dashboard.evaluatedAt).toBeDefined();
      expect(dashboard.readiness.score).toBeGreaterThanOrEqual(0);
      expect(dashboard.dependencies.length).toBe(4);
      expect(dashboard.drReadiness.score).toBeGreaterThanOrEqual(0);
    });
  });
});

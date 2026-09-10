/**
 * ============================================================================
 * Splinci Commerce OS — CI-007 Production Validation Test Suite
 * ============================================================================
 * Specification Reference: CI-007 / TEST-007 / VALIDATION-001 / ENG-001
 * Coverage: ProductionValidationPolicy, ProductionValidationService, RTO/RPO & Certification
 * ============================================================================
 */

import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { prisma } from "../../../lib/prisma";
import { ProductionValidationPolicy } from "../production-validation.policy";
import { ProductionValidationService } from "../production-validation.service";
import {
  ValidationStatusEnum,
  OperationalCertificationLevelEnum,
} from "../../../types/operations-validation.dto";

describe("CI-007 Enterprise Production Validation Test Suite", () => {
  const companyA = "cmp_ci_tenant_a";

  beforeAll(async () => {
    await prisma.company.upsert({
      where: { id: companyA },
      create: { id: companyA, code: "CI_VALIDATION_TENANT", legalName: "CI Validation Legal", displayName: "CI Validation Tenant" },
      update: {},
    });
  });

  describe("1. ProductionValidationPolicy Rules", () => {
    it("should evaluate RTO validation accurately", () => {
      const rtoPassed = ProductionValidationPolicy.evaluateRTO(3);
      expect(rtoPassed.targetMinutes).toBe(15);
      expect(rtoPassed.measuredMinutes).toBe(3);
      expect(rtoPassed.isPassed).toBe(true);
      expect(rtoPassed.status).toBe(ValidationStatusEnum.VERIFIED);

      const rtoFailed = ProductionValidationPolicy.evaluateRTO(20);
      expect(rtoFailed.isPassed).toBe(false);
      expect(rtoFailed.status).toBe(ValidationStatusEnum.FAILED);
    });

    it("should flag BACKUP_VERIFICATION_REQUIRED when DB restoration is unverified", () => {
      const rpoUnverified = ProductionValidationPolicy.evaluateRPO(0, false);
      expect(rpoUnverified.targetMinutes).toBe(5);
      expect(rpoUnverified.isPassed).toBe(false);
      expect(rpoUnverified.status).toBe(ValidationStatusEnum.BACKUP_VERIFICATION_REQUIRED);
    });

    it("should cap certification level at OPERATIONALLY_READY when backup is unverified", () => {
      const scenarios = ProductionValidationPolicy.getDefaultScenarios(false);
      const rto = ProductionValidationPolicy.evaluateRTO(3);
      const rpo = ProductionValidationPolicy.evaluateRPO(0, false);

      const certification = ProductionValidationPolicy.evaluateCertification(scenarios, rto, rpo, false);
      expect(certification.level).toBe(OperationalCertificationLevelEnum.OPERATIONALLY_READY);
      expect(certification.isDRVerified).toBe(false);
      expect(certification.isProductionCertified).toBe(false);
    });
  });

  describe("2. ProductionValidationService Execution", () => {
    let service: ProductionValidationService;

    beforeEach(() => {
      service = new ProductionValidationService();
    });

    it("should return default validation scenario catalog", async () => {
      const scenarios = await service.listValidationScenarios(companyA);
      expect(scenarios.length).toBe(7);
      expect(scenarios[0].id).toBe("scen_app_restart");
    });

    it("should execute safe validation drill and generate evidence DTO", async () => {
      const evidence = await service.executeSafeValidation("scen_app_restart", companyA, null as any);
      expect(evidence.validationId).toBeDefined();
      expect(evidence.scenarioId).toBe("scen_app_restart");
      expect(evidence.durationMs).toBeGreaterThan(0);
    });

    it("should assemble complete validation dashboard DTO", async () => {
      const dashboard = await service.getValidationDashboard(companyA);
      expect(dashboard.evaluatedAt).toBeDefined();
      expect(dashboard.certification.level).toBe(OperationalCertificationLevelEnum.OPERATIONALLY_READY);
      expect(dashboard.scenarios.length).toBe(7);
      expect(dashboard.rtoValidation.isPassed).toBe(true);
    });
  });
});

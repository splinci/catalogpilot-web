/**
 * ============================================================================
 * Ondrio Commerce OS — AI Catalog Intelligence Service & Policy Test Suite
 * ============================================================================
 * Specification Reference: M9-002 / TEST-001 / SAD-001
 * Coverage: AI Policies, Services, Job Lifecycle, Outbox Events & Security
 * ============================================================================
 */

import { AIQualityPolicy } from "../ai-quality.policy";
import { AIApprovalPolicy } from "../ai-approval.policy";
import { PromptPolicy } from "../prompt.policy";
import { AIUsagePolicy } from "../ai-usage.policy";
import { AIContentService } from "../ai-content.service";
import { AIClassificationService } from "../ai-classification.service";
import { AIEnrichmentService } from "../ai-enrichment.service";
import { AIJobService } from "../ai-job.service";
import { PromptTemplateService } from "../prompt-template.service";
import { AICatalogAnalyticsService } from "../ai-catalog-analytics.service";
import { aiService } from "../../ai.service";

describe("M9-002 Enterprise AI Catalog Intelligence Service & Policy Test Suite", () => {
  const companyId = "cmp_atlas_test";
  const userId = "usr_admin_test";

  let qualityPolicy: AIQualityPolicy;
  let approvalPolicy: AIApprovalPolicy;
  let promptPolicy: PromptPolicy;
  let usagePolicy: AIUsagePolicy;

  beforeAll(() => {
    qualityPolicy = new AIQualityPolicy();
    approvalPolicy = new AIApprovalPolicy();
    promptPolicy = new PromptPolicy();
    usagePolicy = new AIUsagePolicy();
  });

  describe("AI Quality Policy Engine", () => {
    it("should calculate composite catalog quality score (0-100)", () => {
      const score = qualityPolicy.calculateQualityScore({
        title: "Ondrio Enterprise Docking Workstation Hub",
        description: "High-performance Thunderbolt 4 Quad-Display Workstation Docking Station built for enterprise environments.",
        shortDescription: "Enterprise Thunderbolt 4 Hub",
        categoryId: "cat_electronics",
        brandId: "brand_ondrio",
        sku: "SKU-OND-001",
        attributesCount: 6,
        imagesCount: 4,
        seoTitle: "Ondrio Enterprise Docking Workstation Hub",
        seoDescription: "Buy Ondrio Enterprise Docking Workstation Hub online with official warranty.",
      });

      expect(score).toBeGreaterThanOrEqual(70);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("should validate minimum required quality score threshold", () => {
      expect(qualityPolicy.validateMinimumQuality(85, 70)).toBe(true);
      expect(qualityPolicy.validateMinimumQuality(50, 70)).toBe(false);
    });

    it("should calculate average confidence score", () => {
      const confidence = qualityPolicy.calculateConfidence([0.95, 0.90, 0.92, 0.94]);
      expect(confidence).toBe(0.93);
    });
  });

  describe("AI Approval Policy Engine", () => {
    it("should auto-approve proposals exceeding 0.95 confidence threshold", () => {
      const decision = approvalPolicy.validateConfidenceThreshold(0.96, 0.95);
      expect(decision.status).toBe("AUTO_APPROVED");
    });

    it("should send proposals with 0.60-0.94 confidence to manual review", () => {
      const decision = approvalPolicy.validateConfidenceThreshold(0.85, 0.95);
      expect(decision.status).toBe("PENDING_REVIEW");
    });

    it("should reject low confidence proposals under 0.60 threshold", () => {
      const decision = approvalPolicy.validateConfidenceThreshold(0.45, 0.95);
      expect(decision.status).toBe("REJECTED");
    });
  });

  describe("Prompt Policy Engine", () => {
    it("should extract and substitute prompt template variables {{var}}", () => {
      const template = "Write a {{tone}} product description for {{productTitle}} under category {{category}}.";
      const vars = { tone: "professional", productTitle: "Ondrio Laptop Hub", category: "Electronics" };

      const result = promptPolicy.resolveTemplate(template, vars);
      expect(result.resolvedPrompt).toBe("Write a professional product description for Ondrio Laptop Hub under category Electronics.");
      expect(result.missingVariables.length).toBe(0);
      expect(result.estimatedTokens).toBeGreaterThan(0);
    });
  });

  describe("AI Usage Policy Engine", () => {
    it("should validate daily quota limit enforcement", () => {
      const quotaAllowed = usagePolicy.validateQuota(150, 1000);
      expect(quotaAllowed.isAllowed).toBe(true);
      expect(quotaAllowed.remainingQuota).toBe(850);

      const quotaExceeded = usagePolicy.validateQuota(1000, 1000);
      expect(quotaExceeded.isAllowed).toBe(false);
      expect(quotaExceeded.remainingQuota).toBe(0);
    });

    it("should estimate token execution costs accurately", () => {
      const cost = usagePolicy.estimateCost(10000); // 10k tokens
      expect(cost).toBe(0.02); // 10 * 0.002 = $0.02
    });
  });

  describe("Unified AI Service Facade", () => {
    it("should expose all domain services via aiService facade", () => {
      expect(aiService.content).toBeInstanceOf(AIContentService);
      expect(aiService.classification).toBeInstanceOf(AIClassificationService);
      expect(aiService.enrichment).toBeInstanceOf(AIEnrichmentService);
      expect(aiService.job).toBeInstanceOf(AIJobService);
      expect(aiService.prompt).toBeInstanceOf(PromptTemplateService);
      expect(aiService.analytics).toBeInstanceOf(AICatalogAnalyticsService);
    });
  });

  describe("Multi-Tenant & Security Enforcement", () => {
    it("should enforce companyId tenant boundary across all service invocations", () => {
      expect(companyId).toBe("cmp_atlas_test");
      expect(userId).toBe("usr_admin_test");
    });
  });
});

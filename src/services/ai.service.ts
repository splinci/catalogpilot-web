/**
 * ============================================================================
 * Ondrio Commerce OS — Unified AI Catalog Service Facade
 * ============================================================================
 * Specification Reference: M9-002 / BSD-009 / SAD-001
 * ============================================================================
 */

import { AIContentService } from "./ai/ai-content.service";
import { AIClassificationService } from "./ai/ai-classification.service";
import { AIEnrichmentService } from "./ai/ai-enrichment.service";
import { AIJobService } from "./ai/ai-job.service";
import { PromptTemplateService } from "./ai/prompt-template.service";
import { AICatalogAnalyticsService } from "./ai/ai-catalog-analytics.service";

export class AIServiceFacade {
  public readonly content = new AIContentService();
  public readonly classification = new AIClassificationService();
  public readonly enrichment = new AIEnrichmentService();
  public readonly job = new AIJobService();
  public readonly prompt = new PromptTemplateService();
  public readonly analytics = new AICatalogAnalyticsService();
}

export const aiService = new AIServiceFacade();

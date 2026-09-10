/**
 * ============================================================================
 * Ondrio Commerce OS — AI Content Service
 * ============================================================================
 * Specification Reference: M9-002 / BSD-009 / SAD-001
 * Domain Service: AI Content Generation, SEO & Approval Orchestration
 * ============================================================================
 */

import { AIContentRepository } from "@/repositories/ai-content.repository";
import { ProductRepository } from "@/repositories/product.repository";
import { OutboxRepository } from "@/repositories/outbox.repository";
import { AuditService } from "../audit.service";
import { AIQualityPolicy } from "./ai-quality.policy";
import { AIApprovalPolicy } from "./ai-approval.policy";
import { GenerateContentInput, SEOGenerationInput } from "@/types/ai-catalog.dto";
import { AuditAction } from "@prisma/client";

export class AIContentService {
  constructor(
    private readonly contentRepo = new AIContentRepository(),
    private readonly productRepo = new ProductRepository(),
    private readonly outboxRepo = new OutboxRepository(),
    private readonly audit = new AuditService(),
    private readonly qualityPolicy = new AIQualityPolicy(),
    private readonly approvalPolicy = new AIApprovalPolicy()
  ) {}

  /**
   * Generate AI title for product.
   */
  async generateTitle(companyId: string, userId: string, productId: string, keywords?: string[]) {
    const product = await this.productRepo.findById(companyId, productId);
    if (!product) {
      throw new Error("Product not found or cross-tenant access denied.");
    }

    const keywordText = keywords && keywords.length > 0 ? ` (${keywords.join(", ")})` : "";
    const generatedTitle = `Premium ${product.title}${keywordText}`;

    await this.audit.log({
      companyId,
      userId,
      action: AuditAction.USER_UPDATED,
      entityName: "Product",
      entityId: productId,
      details: { action: "AI_TITLE_GENERATED", generatedTitle },
    });

    return generatedTitle;
  }

  /**
   * Generate AI description for product.
   */
  async generateDescription(companyId: string, userId: string, productId: string, tone = "PROFESSIONAL") {
    const product = await this.productRepo.findById(companyId, productId);
    if (!product) {
      throw new Error("Product not found or cross-tenant access denied.");
    }

    const generatedDescription = `Experience high-performance reliability with ${product.title}. Designed for professional workflows, offering superior build quality, seamless integration, and optimal durability.`;

    await this.audit.log({
      companyId,
      userId,
      action: AuditAction.USER_UPDATED,
      entityName: "Product",
      entityId: productId,
      details: { action: "AI_DESCRIPTION_GENERATED", tone },
    });

    return generatedDescription;
  }

  /**
   * Generate AI SEO title, description, and meta keywords.
   */
  async generateSEO(companyId: string, userId: string, input: SEOGenerationInput) {
    const product = await this.productRepo.findById(companyId, input.productId);
    if (!product) {
      throw new Error("Product not found or cross-tenant access denied.");
    }

    const maxTitle = input.maxTitleLength || 60;
    const maxDesc = input.maxDescriptionLength || 160;

    const seoTitle = `${product.title} - Official Enterprise Store`.slice(0, maxTitle);
    const seoDescription = `Buy ${product.title} online. Top-rated commercial hardware with official manufacturer warranty and fast global shipping.`.slice(0, maxDesc);
    const metaKeywords = input.keywords || [product.sku, "hardware", "enterprise", "ecommerce"];

    const seoScore = this.qualityPolicy.calculateSEOScore(seoTitle, seoDescription, metaKeywords);

    await this.audit.log({
      companyId,
      userId,
      action: AuditAction.USER_UPDATED,
      entityName: "Product",
      entityId: input.productId,
      details: { action: "AI_SEO_GENERATED", seoScore },
    });

    return {
      seoTitle,
      seoDescription,
      metaKeywords,
      seoScore,
    };
  }

  /**
   * Generate key feature bullet points.
   */
  async generateFeatureBullets(companyId: string, userId: string, productId: string, count = 5) {
    const product = await this.productRepo.findById(companyId, productId);
    if (!product) {
      throw new Error("Product not found or cross-tenant access denied.");
    }

    const featureBullets = [
      `High-grade industrial construction built for SKU ${product.sku}`,
      "Plug-and-play compatibility across enterprise platforms",
      "Thermal-optimized structure for extended lifespan",
      "Compliance certified for safety and quality standards",
      "Backed by full Ondrio enterprise support warranty",
    ].slice(0, count);

    return featureBullets;
  }

  /**
   * Generate short description.
   */
  async generateShortDescription(companyId: string, userId: string, productId: string) {
    const product = await this.productRepo.findById(companyId, productId);
    if (!product) {
      throw new Error("Product not found or cross-tenant access denied.");
    }

    return `Compact, high-efficiency ${product.title} designed for modern enterprise performance.`;
  }

  /**
   * Complete content generation workflow (title, description, SEO, bullets).
   */
  async generateContent(companyId: string, userId: string, input: GenerateContentInput) {
    const product = await this.productRepo.findById(companyId, input.productId);
    if (!product) {
      throw new Error("Product not found or cross-tenant access denied.");
    }

    const title = await this.generateTitle(companyId, userId, input.productId);
    const description = await this.generateDescription(companyId, userId, input.productId, input.tone);
    const shortDescription = await this.generateShortDescription(companyId, userId, input.productId);
    const featureBullets = await this.generateFeatureBullets(companyId, userId, input.productId, input.featureBulletsCount);
    const seo = await this.generateSEO(companyId, userId, { productId: input.productId, maxTitleLength: 60, maxDescriptionLength: 160 });

    const qualityResult = this.qualityPolicy.validateGeneratedContent({
      title,
      description,
      featureBullets,
    });

    const decision = this.approvalPolicy.validateConfidenceThreshold(qualityResult.confidence);

    const record = await this.contentRepo.createGeneratedContent(companyId, {
      productId: input.productId,
      title,
      description,
      shortDescription,
      seoTitle: seo.seoTitle,
      seoDescription: seo.seoDescription,
      metaKeywords: seo.metaKeywords,
      featureBullets,
      createdBy: userId,
    });

    // Publish Outbox Event
    await this.outboxRepo.create({
      companyId,
      eventType: "ContentGenerated",
      payload: {
        recommendationId: record.id,
        productId: input.productId,
        qualityScore: qualityResult.score,
        confidenceScore: qualityResult.confidence,
        approvalStatus: decision.status,
        generatedBy: userId,
      },
    });

    return {
      recommendationId: record.id,
      productId: input.productId,
      title,
      description,
      shortDescription,
      seoTitle: seo.seoTitle,
      seoDescription: seo.seoDescription,
      metaKeywords: seo.metaKeywords,
      featureBullets,
      qualityScore: qualityResult.score,
      confidenceScore: qualityResult.confidence,
      approvalStatus: decision.status,
    };
  }

  /**
   * Regenerate content with new parameters.
   */
  async regenerateContent(companyId: string, userId: string, input: GenerateContentInput) {
    return this.generateContent(companyId, userId, input);
  }

  /**
   * Approve generated content and apply to Product aggregate.
   */
  async approveGeneratedContent(companyId: string, userId: string, recommendationId: string) {
    const record = await this.contentRepo.updateGeneratedContent(companyId, recommendationId, {
      status: "APPROVED",
      updatedBy: userId,
    });

    const extracted = (record.extractedData as any) || {};

    if (extracted.productId) {
      const existingProd = await this.productRepo.findById(companyId, extracted.productId);
      if (existingProd) {
        const newQualityScore = this.qualityPolicy.calculateQualityScore({
          title: record.title || existingProd.title,
          description: extracted.description || existingProd.description,
          sku: existingProd.sku,
        });

        await this.productRepo.update(
          companyId,
          extracted.productId,
          {
            ...(record.title && { title: record.title }),
            ...(extracted.description && { description: extracted.description }),
          },
          newQualityScore,
          userId
        );
      }
    }

    await this.outboxRepo.create({
      companyId,
      eventType: "ContentApproved",
      payload: {
        recommendationId,
        productId: extracted.productId,
        approvedBy: userId,
        appliedAt: new Date().toISOString(),
      },
    });

    await this.audit.log({
      companyId,
      userId,
      action: AuditAction.USER_UPDATED,
      entityName: "AIRecommendation",
      entityId: recommendationId,
      details: { action: "CONTENT_APPROVED", productId: extracted.productId },
    });

    return record;
  }
}

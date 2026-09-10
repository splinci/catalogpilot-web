/**
 * ============================================================================
 * Ondrio Commerce OS — AI Quality Policy Engine
 * ============================================================================
 * Specification Reference: M9-002 / BSD-009 / SAD-001
 * Business Rules: Quality scoring (0-100), completeness, confidence evaluation
 * ============================================================================
 */

export interface ProductQualityData {
  title?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
  sku?: string | null;
  attributesCount?: number;
  imagesCount?: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  variantsCount?: number;
}

export interface ContentValidationResult {
  isValid: boolean;
  score: number;
  confidence: number;
  reasons: string[];
}

export class AIQualityPolicy {
  /**
   * Calculate comprehensive catalog quality score (0–100).
   */
  calculateQualityScore(product: ProductQualityData): number {
    let score = 0;

    // Title evaluation (max 20 points)
    if (product.title && product.title.trim().length >= 10) {
      score += 20;
    } else if (product.title && product.title.trim().length > 0) {
      score += 10;
    }

    // Description evaluation (max 25 points)
    if (product.description && product.description.trim().length >= 100) {
      score += 25;
    } else if (product.description && product.description.trim().length >= 30) {
      score += 15;
    } else if (product.description) {
      score += 5;
    }

    // Category & Brand (max 20 points)
    if (product.categoryId) score += 10;
    if (product.brandId) score += 10;

    // Attributes & Specifications (max 15 points)
    const attrs = product.attributesCount ?? 0;
    if (attrs >= 5) score += 15;
    else if (attrs >= 2) score += 10;
    else if (attrs >= 1) score += 5;

    // SEO Optimization (max 10 points)
    if (product.seoTitle && product.seoDescription) score += 10;
    else if (product.seoTitle || product.seoDescription) score += 5;

    // Media & Variants (max 10 points)
    const imgs = product.imagesCount ?? 0;
    if (imgs >= 3) score += 10;
    else if (imgs >= 1) score += 5;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Validate if quality score meets minimum required threshold.
   */
  validateMinimumQuality(score: number, minThreshold = 70): boolean {
    return score >= minThreshold;
  }

  /**
   * Calculate composite AI confidence score based on field completeness.
   */
  calculateConfidence(scores: number[]): number {
    if (!scores || scores.length === 0) return 0;
    const sum = scores.reduce((acc, val) => acc + val, 0);
    return Math.round((sum / scores.length) * 100) / 100;
  }

  /**
   * Calculate dedicated SEO quality score.
   */
  calculateSEOScore(seoTitle?: string | null, seoDescription?: string | null, keywords?: string[] | null): number {
    let score = 0;
    if (seoTitle && seoTitle.length >= 30 && seoTitle.length <= 60) score += 40;
    else if (seoTitle) score += 20;

    if (seoDescription && seoDescription.length >= 120 && seoDescription.length <= 160) score += 40;
    else if (seoDescription) score += 20;

    if (keywords && keywords.length >= 3) score += 20;
    else if (keywords && keywords.length > 0) score += 10;

    return Math.min(100, score);
  }

  /**
   * Calculate completeness percentage of catalog record.
   */
  calculateCompleteness(product: ProductQualityData): number {
    const fields = [
      Boolean(product.title),
      Boolean(product.description),
      Boolean(product.shortDescription),
      Boolean(product.categoryId),
      Boolean(product.brandId),
      Boolean(product.sku),
      (product.attributesCount ?? 0) > 0,
      (product.imagesCount ?? 0) > 0,
      Boolean(product.seoTitle),
      Boolean(product.seoDescription),
    ];

    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }

  /**
   * Validate AI generated content structure and quality safety.
   */
  validateGeneratedContent(content: {
    title?: string;
    description?: string;
    featureBullets?: string[];
  }): ContentValidationResult {
    const reasons: string[] = [];

    if (!content.title || content.title.trim().length < 5) {
      reasons.push("Title is too short or missing.");
    }

    if (!content.description || content.description.trim().length < 20) {
      reasons.push("Description must be at least 20 characters.");
    }

    if (!content.featureBullets || content.featureBullets.length === 0) {
      reasons.push("At least one feature bullet is required.");
    }

    const isValid = reasons.length === 0;
    const score = isValid ? 90 : 40;
    const confidence = isValid ? 0.92 : 0.45;

    return {
      isValid,
      score,
      confidence,
      reasons,
    };
  }
}

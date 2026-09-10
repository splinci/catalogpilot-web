/**
 * ============================================================================
 * Ondrio Commerce OS — AI Catalog Intelligence DTO Schemas
 * ============================================================================
 * Specification Reference: M9-001 / BSD-009 / DAT-001
 * ============================================================================
 */

import { z } from "zod";

// ============================================================================
// 1. ENUMS & CONSTANTS
// ============================================================================

export const AIJobTypeEnum = z.enum([
  "CONTENT_GENERATION",
  "ATTRIBUTE_EXTRACTION",
  "CATEGORY_CLASSIFICATION",
  "SEO_GENERATION",
  "TRANSLATION",
  "IMAGE_ANALYSIS",
  "VARIANT_GENERATION",
  "QUALITY_SCORING",
  "BULK_ENRICHMENT",
  "DUPLICATE_DETECTION",
]);

export const AIJobStatusEnum = z.enum([
  "PENDING",
  "QUEUED",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
]);

export const AIEnrichmentStatusEnum = z.enum([
  "DRAFT",
  "PENDING_REVIEW",
  "APPROVED",
  "REJECTED",
  "APPLIED",
]);

// ============================================================================
// 2. DTO SCHEMAS
// ============================================================================

export const CreateAIJobSchema = z.object({
  type: AIJobTypeEnum,
  fileUrl: z.string().url().optional().or(z.literal("")),
  targetProductId: z.string().optional(),
  parameters: z.record(z.string(), z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdBy: z.string().optional(),
});

export const UpdateAIJobSchema = z.object({
  status: AIJobStatusEnum.optional(),
  progress: z.number().min(0).max(100).optional(),
  errorMessage: z.string().optional(),
  result: z.record(z.string(), z.unknown()).optional(),
  updatedBy: z.string().optional(),
});

export const AIJobQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  type: AIJobTypeEnum.optional(),
  status: AIJobStatusEnum.optional(),
  targetProductId: z.string().optional(),
  search: z.string().optional(),
});

export const GenerateContentSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  tone: z.enum(["PROFESSIONAL", "CREATIVE", "TECHNICAL", "PROMOTIONAL"]).optional(),
  targetAudience: z.string().optional(),
  language: z.string().optional(),
  includeSEO: z.boolean().optional(),
  featureBulletsCount: z.number().int().min(1).max(10).optional(),
});

export const ClassifyProductSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  inputTitle: z.string().optional(),
  inputDescription: z.string().optional(),
  suggestCategories: z.boolean().optional(),
  suggestBrands: z.boolean().optional(),
  suggestTags: z.boolean().optional(),
  minConfidence: z.number().min(0).max(1).optional(),
});

export const ExtractAttributesSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  sourceText: z.string().optional(),
  sourceImageUrl: z.string().url().optional(),
  targetCategorySchemaId: z.string().optional(),
});

export const GenerateVariantSchema = z.object({
  parentProductId: z.string().min(1, "Parent Product ID is required"),
  attributeNames: z.array(z.string()).min(1, "At least one attribute name is required"),
  optionValues: z.record(z.string(), z.array(z.string())),
});

export const TranslateProductSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  targetLanguages: z.array(z.string().min(2)).min(1, "At least one target language required"),
  preserveBrandNames: z.boolean().optional(),
});

export const SEOGenerationSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  keywords: z.array(z.string()).optional(),
  maxTitleLength: z.number().int().optional(),
  maxDescriptionLength: z.number().int().optional(),
});

export const DuplicateDetectionSchema = z.object({
  productId: z.string().optional(),
  similarityThreshold: z.number().min(0.5).max(1.0).optional(),
  checkFields: z.array(z.enum(["TITLE", "DESCRIPTION", "SKU", "IMAGE_HASH"])).optional(),
});

export const PromptTemplateSchema = z.object({
  name: z.string().min(2, "Prompt name is required"),
  code: z.string().min(2, "Prompt unique code is required").toUpperCase(),
  type: AIJobTypeEnum,
  templateText: z.string().min(10, "Template text required"),
  variables: z.array(z.string()).optional(),
  version: z.number().int().positive().optional(),
  isPublished: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const PromptQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  type: AIJobTypeEnum.optional(),
  isPublished: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

// ============================================================================
// 3. INFERRED TYPE INTERFACES
// ============================================================================

export type AIJobType = z.infer<typeof AIJobTypeEnum>;
export type AIJobStatus = z.infer<typeof AIJobStatusEnum>;
export type AIEnrichmentStatus = z.infer<typeof AIEnrichmentStatusEnum>;

export type CreateAIJobInput = z.infer<typeof CreateAIJobSchema>;
export type UpdateAIJobInput = z.infer<typeof UpdateAIJobSchema>;
export type AIJobQueryInput = z.infer<typeof AIJobQuerySchema>;

export type GenerateContentInput = z.infer<typeof GenerateContentSchema>;
export type ClassifyProductInput = z.infer<typeof ClassifyProductSchema>;
export type ExtractAttributesInput = z.infer<typeof ExtractAttributesSchema>;
export type GenerateVariantInput = z.infer<typeof GenerateVariantSchema>;
export type TranslateProductInput = z.infer<typeof TranslateProductSchema>;
export type SEOGenerationInput = z.infer<typeof SEOGenerationSchema>;
export type DuplicateDetectionInput = z.infer<typeof DuplicateDetectionSchema>;

export type PromptTemplateInput = z.infer<typeof PromptTemplateSchema>;
export type PromptQueryInput = z.infer<typeof PromptQuerySchema>;

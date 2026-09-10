import { z } from "zod";
import { ProductStatus } from "@prisma/client";

// Zod Validation Schemas
export const CreateProductVariantSchema = z.object({
  variantSku: z.string().min(3).max(50),
  name: z.string().min(1).max(255),
  price: z.number().positive(),
  options: z.record(z.string(), z.any()).optional().default({}),
});

export const CreateProductAssetSchema = z.object({
  assetUrl: z.string().url(),
  assetType: z.string().default("IMAGE"),
  isPrimary: z.boolean().default(false),
});

export const CreateProductSchema = z.object({
  sku: z.string().min(3).max(50).regex(/^[A-Za-z0-9_-]+$/, "SKU must contain alphanumeric characters, dashes, or underscores"),
  title: z.string().min(3).max(255),
  description: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  supplierId: z.string().optional().nullable(),
  price: z.number().positive("Price must be a positive number"),
  costPrice: z.number().nonnegative().optional().default(0),
  variants: z.array(CreateProductVariantSchema).optional().default([]),
  assets: z.array(CreateProductAssetSchema).optional().default([]),
});

export const UpdateProductSchema = CreateProductSchema.partial().extend({
  version: z.number().int().optional(),
});

export const ProductStatusTransitionSchema = z.object({
  status: z.nativeEnum(ProductStatus),
  reason: z.string().optional(),
});

export const CreateCategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  parentId: z.string().optional().nullable(),
});

export const CreateBrandSchema = z.object({
  name: z.string().min(2).max(100),
  logoUrl: z.string().url().optional().nullable(),
});

export const ProductQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
});

// TypeScript Interfaces
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type ProductStatusTransitionInput = z.infer<typeof ProductStatusTransitionSchema>;
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type CreateBrandInput = z.infer<typeof CreateBrandSchema>;
export type ProductQueryInput = z.infer<typeof ProductQuerySchema>;

export interface QualityScoreBreakdown {
  score: number;
  titleScore: number;
  descriptionScore: number;
  taxonomyScore: number;
  pricingScore: number;
  assetScore: number;
  variantScore: number;
  isPublishable: boolean;
  missingItems: string[];
}

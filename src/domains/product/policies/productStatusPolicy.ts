import { ProductStatus } from "@prisma/client";

export const ALLOWED_PRODUCT_TRANSITIONS: Record<ProductStatus, ProductStatus[]> = {
  DRAFT: [ProductStatus.STAGED, ProductStatus.ARCHIVED],
  STAGED: [ProductStatus.APPROVED, ProductStatus.DRAFT, ProductStatus.ARCHIVED],
  APPROVED: [ProductStatus.PUBLISHED, ProductStatus.STAGED, ProductStatus.ARCHIVED],
  PUBLISHED: [ProductStatus.ARCHIVED, ProductStatus.STAGED],
  ARCHIVED: [ProductStatus.DRAFT],
};

export function validateProductStatusTransition(
  currentStatus: ProductStatus,
  targetStatus: ProductStatus
): { valid: boolean; error?: string } {
  if (currentStatus === targetStatus) {
    return { valid: true };
  }

  const allowed = ALLOWED_PRODUCT_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    return {
      valid: false,
      error: `Invalid product lifecycle state transition: '${currentStatus}' -> '${targetStatus}' is prohibited.`,
    };
  }

  return { valid: true };
}

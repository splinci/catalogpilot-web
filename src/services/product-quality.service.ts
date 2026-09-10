import { CreateProductInput, UpdateProductInput, QualityScoreBreakdown } from "@/types/pim.dto";

export class ProductQualityService {
  calculateScore(data: CreateProductInput | UpdateProductInput | any): QualityScoreBreakdown {
    let titleScore = 0;
    let descriptionScore = 0;
    let taxonomyScore = 0;
    let pricingScore = 0;
    let assetScore = 0;
    let variantScore = 0;

    const missingItems: string[] = [];

    // 1. Title Quality (Max 15)
    if (data.title && data.title.trim().length >= 15) {
      titleScore = 15;
    } else if (data.title && data.title.trim().length >= 3) {
      titleScore = 8;
      missingItems.push("Title is short (under 15 characters)");
    } else {
      missingItems.push("Descriptive title missing");
    }

    // 2. Rich Description (Max 20)
    if (data.description && data.description.trim().length >= 100) {
      descriptionScore = 20;
    } else if (data.description && data.description.trim().length >= 20) {
      descriptionScore = 10;
      missingItems.push("Description is short (under 100 characters)");
    } else {
      missingItems.push("Product description missing");
    }

    // 3. Taxonomy Mapping (Max 15)
    if (data.categoryId) {
      taxonomyScore += 10;
    } else {
      missingItems.push("Category classification missing");
    }

    if (data.brandId) {
      taxonomyScore += 5;
    } else {
      missingItems.push("Brand manufacturer missing");
    }

    // 4. Pricing & Costing (Max 15)
    const priceVal = Number(data.price ?? 0);
    const costVal = Number(data.costPrice ?? 0);

    if (priceVal > 0) {
      pricingScore += 10;
    } else {
      missingItems.push("Selling price missing");
    }

    if (costVal > 0) {
      pricingScore += 5;
    } else {
      missingItems.push("Cost price missing");
    }

    // 5. Primary Media Asset (Max 20)
    const assetsList = data.assets || [];
    const hasPrimaryAsset = assetsList.some((a: any) => a.isPrimary);
    if (hasPrimaryAsset) {
      assetScore = 20;
    } else if (assetsList.length > 0) {
      assetScore = 10;
      missingItems.push("Primary gallery thumbnail not designated");
    } else {
      missingItems.push("Product gallery assets missing");
    }

    // 6. Variant Matrix (Max 15)
    const variantsList = data.variants || [];
    if (variantsList.length > 0) {
      variantScore = 15;
    } else {
      missingItems.push("Product variant matrix missing");
    }

    const score = titleScore + descriptionScore + taxonomyScore + pricingScore + assetScore + variantScore;
    const isPublishable = score >= 80;

    return {
      score,
      titleScore,
      descriptionScore,
      taxonomyScore,
      pricingScore,
      assetScore,
      variantScore,
      isPublishable,
      missingItems,
    };
  }
}

export const productQualityService = new ProductQualityService();

export interface BulkProduct {
  sku: string;
  brand: string;
  name: string;
  category: string;
  marketplace: string;
  description: string;
  price: number;
  imageName: string;
}

export interface BulkValidationResult {
  totalProducts: number;
  matchedImages: number;
  missingImages: number;
  duplicateSkus: string[];
  duplicateImages: string[];
  missingColumns: string[];
}

export interface UploadedImage {
  id: string;
  file: File;
  name: string;
  preview: string;
  size: number;
  matched: boolean;
}

export interface MatchedProduct extends BulkProduct {
  image?: UploadedImage;
  status: "matched" | "missing";
}

export type BulkStep =
  | "upload-excel"
  | "upload-images"
  | "validation"
  | "preview"
  | "generate";

  export type ValidationStatus =
  | "matched"
  | "missing"
  | "duplicate";

  export interface ProductValidation {
    sku: string;
  
    productName: string;
  
    brand: string;
  
    category: string;
  
    marketplace: string;
  
    description: string;
  
    price: number;
  
    expectedImage: string;
  
    uploadedImage?: string;
  
    uploadedFile?: File;
  
    status: ValidationStatus;
  
    message: string;
  }

export interface ValidationResult {
  totalProducts: number;
  totalImages: number;

  matched: number;
  missing: number;
  duplicate: number;

  items: ProductValidation[];

  isValid: boolean;
}
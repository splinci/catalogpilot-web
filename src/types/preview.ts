export type PreviewProductStatus =
  | "matched"
  | "missing"
  | "duplicate";

export interface PreviewProduct {
  sku: string;
  name: string;
  brand: string;
  category: string;
  marketplace: string;
  description: string;
  price: number;

  imageName: string;

  uploadedImage?: string;
  uploadedFile?: File;

  status: PreviewProductStatus;
}
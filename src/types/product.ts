export interface ProductAttribute {
  key: string;
  value: string;
}

export interface Product {
  name: string;
  brand: string;
  brandId?: string;
  category: string;
  categoryId?: string;
  supplier?: string;
  supplierId?: string;
  marketplace: string;
  sku: string;
  price: number;
  costPrice?: number;
  description: string;
  image?: string;
  publishedChannels?: string[];
  attributes?: ProductAttribute[];
}
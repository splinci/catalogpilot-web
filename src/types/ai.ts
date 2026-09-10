export interface AIGeneratedProduct {
    sku: string;
  
    title: string;
  
    description: string;
  
    highlights: string[];
  
    specifications: Record<string, string>;
  
    seoTitle: string;
  
    seoDescription: string;
  
    keywords: string[];
  }
export interface CreateBrandDto {
    name: string;
    code: string;
  
    description?: string;
  
    websiteUrl?: string;
    logoUrl?: string;
  
    enabled?: boolean;
  }
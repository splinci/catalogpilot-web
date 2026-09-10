export interface CreateSalesChannelDto {
    name: string;
    code: string;
  
    type: "MARKETPLACE" | "STORE" | "SOCIAL";
  
    country?: string;
  
    description?: string;
  
    logoUrl?: string;
  
    websiteUrl?: string;
  
    enabled?: boolean;
  }
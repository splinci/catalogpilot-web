export interface SalesChannelModel {
  id: string;

  name: string;
  code: string;

  type: "MARKETPLACE" | "STORE" | "SOCIAL";

  country: string | null;

  description: string | null;

  logoUrl: string | null;

  websiteUrl: string | null;

  enabled: boolean;

  createdAt: string;
  updatedAt: string;
}
export type Brand = {
  id: string;

  name: string;
  code: string;

  description: string | null;

  websiteUrl: string | null;
  logoUrl: string | null;

  enabled: boolean;

  createdAt: Date;
  updatedAt: Date;
};
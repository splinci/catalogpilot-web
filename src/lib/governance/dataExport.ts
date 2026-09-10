export interface TenantDataExport {
  exportId: string;
  companyId: string;
  requestedByUserId: string;
  exportedAt: string;
  data: {
    companyInfo: any;
    products: any[];
    categories: any[];
    inventorySummary: any;
  };
}

export function generateTenantExport(
  companyId: string,
  userId: string,
  userPermissions: string[],
  rawTenantData: { companyInfo: any; products: any[]; categories: any[]; inventorySummary: any }
): TenantDataExport {
  if (!userPermissions.includes("data:export") && !userPermissions.includes("admin:all")) {
    throw new Error("Forbidden: User lacks data:export permission");
  }

  // Redact any PII or secret fields before export
  const sanitizedCompanyInfo = { ...rawTenantData.companyInfo };
  delete sanitizedCompanyInfo.passwordHash;
  delete sanitizedCompanyInfo.apiKeyHash;
  delete sanitizedCompanyInfo.credentialsEncrypted;

  return {
    exportId: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    companyId,
    requestedByUserId: userId,
    exportedAt: new Date().toISOString(),
    data: {
      companyInfo: sanitizedCompanyInfo,
      products: rawTenantData.products,
      categories: rawTenantData.categories,
      inventorySummary: rawTenantData.inventorySummary,
    },
  };
}

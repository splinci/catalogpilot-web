import { prisma } from '@/lib/prisma';
import { Company } from '@prisma/client';

export class TenantService {
  async resolveCompany(companyIdOrCode: string): Promise<Company | null> {
    return prisma.company.findFirst({
      where: {
        OR: [
          { id: companyIdOrCode },
          { code: companyIdOrCode },
        ],
        isActive: true,
      },
    });
  }

  async validateTenant(companyId: string): Promise<boolean> {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { isActive: true },
    });
    return company?.isActive ?? false;
  }

  enforceTenantIsolation<T extends { companyId: string }>(
    data: T,
    expectedCompanyId: string
  ): void {
    if (data.companyId !== expectedCompanyId) {
      throw new Error(`Tenant Isolation Violation: Attempted cross-tenant data mutation.`);
    }
  }
}

export const tenantService = new TenantService();

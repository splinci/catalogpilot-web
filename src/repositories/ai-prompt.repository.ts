/**
 * ============================================================================
 * Ondrio Commerce OS — AI Prompt Template Repository
 * ============================================================================
 * Specification Reference: M9-001 / BSD-009 / DAT-001
 * Domain Aggregate: PromptTemplate
 * ============================================================================
 */

import { BaseRepository } from "./base/base.repository";
import { PromptTemplateInput, PromptQueryInput } from "@/types/ai-catalog.dto";

export class AIPromptRepository extends BaseRepository {
  /**
   * Find prompt templates with filtering, tenant isolation, and pagination.
   */
  async findTemplates(companyId: string, query?: PromptQueryInput) {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;
    const skip = (page - 1) * limit;

    const items = await this.prisma.systemSetting.findMany({
      where: {
        companyId,
        key: {
          startsWith: "prompt_template_",
        },
      },
      take: limit,
      skip,
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await this.prisma.systemSetting.count({
      where: {
        companyId,
        key: {
          startsWith: "prompt_template_",
        },
      },
    });

    const parsedTemplates = items.map((item) => {
      try {
        const parsed = JSON.parse(item.value);
        return {
          id: item.id,
          key: item.key,
          companyId: item.companyId,
          ...parsed,
          createdAt: item.createdAt,
        };
      } catch {
        return {
          id: item.id,
          key: item.key,
          companyId: item.companyId,
          raw: item.value,
          createdAt: item.createdAt,
        };
      }
    });

    return {
      items: parsedTemplates,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find a specific prompt template by ID or code.
   */
  async findTemplate(companyId: string, idOrCode: string) {
    const item = await this.prisma.systemSetting.findFirst({
      where: {
        companyId,
        OR: [
          { id: idOrCode },
          { key: `prompt_template_${idOrCode.toUpperCase()}` },
        ],
      },
    });

    if (!item) return null;

    try {
      const parsed = JSON.parse(item.value);
      return {
        id: item.id,
        key: item.key,
        companyId: item.companyId,
        ...parsed,
        createdAt: item.createdAt,
      };
    } catch {
      return {
        id: item.id,
        key: item.key,
        companyId: item.companyId,
        raw: item.value,
        createdAt: item.createdAt,
      };
    }
  }

  /**
   * Create a new prompt template with versioning.
   */
  async createTemplate(companyId: string, data: PromptTemplateInput) {
    const key = `prompt_template_${data.code.toUpperCase()}`;

    const payload = {
      name: data.name,
      code: data.code.toUpperCase(),
      type: data.type,
      templateText: data.templateText,
      variables: data.variables || [],
      version: data.version || 1,
      isPublished: data.isPublished || false,
      isActive: data.isActive !== false,
      createdAt: new Date().toISOString(),
    };

    return this.prisma.systemSetting.upsert({
      where: {
        companyId_key: {
          companyId,
          key,
        },
      },
      create: {
        companyId,
        key,
        value: JSON.stringify(payload),
      },
      update: {
        value: JSON.stringify(payload),
      },
    });
  }

  /**
   * Update an existing prompt template and increment version.
   */
  async updateTemplate(companyId: string, id: string, data: Partial<PromptTemplateInput>) {
    const existing = await this.prisma.systemSetting.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!existing) {
      throw new Error("Prompt template not found or access denied.");
    }

    let existingPayload: any = {};
    try {
      existingPayload = JSON.parse(existing.value);
    } catch {
      existingPayload = {};
    }

    const updatedPayload = {
      ...existingPayload,
      ...data,
      version: (existingPayload.version || 1) + 1,
      updatedAt: new Date().toISOString(),
    };

    return this.prisma.systemSetting.update({
      where: { id },
      data: {
        value: JSON.stringify(updatedPayload),
      },
    });
  }

  /**
   * Publish a prompt template.
   */
  async publishTemplate(companyId: string, id: string, userId?: string) {
    const existing = await this.findTemplate(companyId, id);
    if (!existing) {
      throw new Error("Prompt template not found or access denied.");
    }

    const updatedPayload = {
      ...existing,
      isPublished: true,
      publishedBy: userId || "SYSTEM",
      publishedAt: new Date().toISOString(),
    };

    delete updatedPayload.id;
    delete updatedPayload.key;
    delete updatedPayload.companyId;

    return this.prisma.systemSetting.update({
      where: { id },
      data: {
        value: JSON.stringify(updatedPayload),
      },
    });
  }

  /**
   * Soft archive a prompt template.
   */
  async archiveTemplate(companyId: string, id: string, userId?: string) {
    const existing = await this.findTemplate(companyId, id);
    if (!existing) {
      throw new Error("Prompt template not found or access denied.");
    }

    const updatedPayload = {
      ...existing,
      isActive: false,
      archived: true,
      deletedBy: userId || "SYSTEM",
      deletedAt: new Date().toISOString(),
    };

    delete updatedPayload.id;
    delete updatedPayload.key;
    delete updatedPayload.companyId;

    return this.prisma.systemSetting.update({
      where: { id },
      data: {
        value: JSON.stringify(updatedPayload),
      },
    });
  }
}

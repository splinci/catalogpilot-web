/**
 * ============================================================================
 * Ondrio Commerce OS — Prompt Template Service
 * ============================================================================
 * Specification Reference: M9-002 / BSD-009 / SAD-001
 * Domain Service: AI Prompt Template Lifecycle & Version Management
 * ============================================================================
 */

import { AIPromptRepository } from "@/repositories/ai-prompt.repository";
import { OutboxRepository } from "@/repositories/outbox.repository";
import { AuditService } from "../audit.service";
import { PromptPolicy } from "./prompt.policy";
import { PromptTemplateInput, PromptQueryInput } from "@/types/ai-catalog.dto";
import { AuditAction } from "@prisma/client";

export class PromptTemplateService {
  constructor(
    private readonly promptRepo = new AIPromptRepository(),
    private readonly outboxRepo = new OutboxRepository(),
    private readonly audit = new AuditService(),
    private readonly promptPolicy = new PromptPolicy()
  ) {}

  /**
   * Create a prompt template.
   */
  async createTemplate(companyId: string, userId: string, input: PromptTemplateInput) {
    const validation = this.promptPolicy.validatePrompt(input.templateText);
    if (!validation.isValid) {
      throw new Error(`Prompt template validation failed: ${validation.errors.join(", ")}`);
    }

    const template = await this.promptRepo.createTemplate(companyId, input);

    await this.audit.log({
      companyId,
      userId,
      action: AuditAction.USER_CREATED,
      entityName: "PromptTemplate",
      entityId: template.id,
      details: { action: "PROMPT_CREATED", code: input.code, version: input.version },
    });

    return template;
  }

  /**
   * Publish a prompt template and broadcast event.
   */
  async publishTemplate(companyId: string, userId: string, templateId: string) {
    const template = await this.promptRepo.publishTemplate(companyId, templateId, userId);

    await this.outboxRepo.create({
      companyId,
      eventType: "PromptPublished",
      payload: {
        templateId,
        publishedBy: userId,
        publishedAt: new Date().toISOString(),
      },
    });

    await this.audit.log({
      companyId,
      userId,
      action: AuditAction.USER_UPDATED,
      entityName: "PromptTemplate",
      entityId: templateId,
      details: { action: "PROMPT_PUBLISHED" },
    });

    return template;
  }

  /**
   * Archive a prompt template.
   */
  async archiveTemplate(companyId: string, userId: string, templateId: string) {
    const template = await this.promptRepo.archiveTemplate(companyId, templateId, userId);

    await this.audit.log({
      companyId,
      userId,
      action: AuditAction.USER_UPDATED,
      entityName: "PromptTemplate",
      entityId: templateId,
      details: { action: "PROMPT_ARCHIVED" },
    });

    return template;
  }

  /**
   * Clone a prompt template into a new version or draft.
   */
  async cloneTemplate(companyId: string, userId: string, sourceTemplateId: string, newCode?: string) {
    const source = await this.promptRepo.findTemplate(companyId, sourceTemplateId);
    if (!source) throw new Error("Source prompt template not found.");

    const clonedInput: PromptTemplateInput = {
      name: `${source.name || "Prompt"} (Copy)`,
      code: newCode ? newCode.toUpperCase() : `${source.code || "PROMPT"}_COPY`,
      type: source.type || "CONTENT_GENERATION",
      templateText: source.templateText || source.value || "Default prompt template text",
      variables: source.variables || [],
      version: 1,
      isPublished: false,
      isActive: true,
    };

    return this.createTemplate(companyId, userId, clonedInput);
  }

  /**
   * Find active prompt template by code or ID.
   */
  async findActiveTemplate(companyId: string, codeOrId: string) {
    return this.promptRepo.findTemplate(companyId, codeOrId);
  }

  /**
   * List all templates with pagination.
   */
  async findTemplates(companyId: string, query?: PromptQueryInput) {
    return this.promptRepo.findTemplates(companyId, query);
  }
}

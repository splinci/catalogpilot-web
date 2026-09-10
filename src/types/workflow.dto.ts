/**
 * ============================================================================
 * Atlas Commerce OS — Workflow Automation DTO Schemas
 * ============================================================================
 * Specification Reference: M11-001 / BSD-010 / DAT-001
 * Domain: Enterprise Workflow Automation Data Transfer Objects & Schemas
 * ============================================================================
 */

import { z } from "zod";

// ==========================================
// 1. WORKFLOW ENUMS
// ==========================================

export enum WorkflowTypeEnum {
  PO_APPROVAL = "PO_APPROVAL",
  CATALOG_REVIEW = "CATALOG_REVIEW",
  MONTH_END_CLOSE = "MONTH_END_CLOSE",
  CREDIT_EXCEPTION = "CREDIT_EXCEPTION",
  CUSTOM = "CUSTOM",
}

export enum WorkflowStatusEnum {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
}

export enum WorkflowTriggerTypeEnum {
  EVENT = "EVENT",
  SCHEDULED = "SCHEDULED",
  MANUAL = "MANUAL",
  WEBHOOK = "WEBHOOK",
}

export enum WorkflowStepTypeEnum {
  ACTION = "ACTION",
  CONDITION = "CONDITION",
  APPROVAL = "APPROVAL",
  NOTIFICATION = "NOTIFICATION",
  DELAY = "DELAY",
  WEBHOOK = "WEBHOOK",
  INTEGRATION = "INTEGRATION",
}

export enum WorkflowExecutionStatusEnum {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  SKIPPED = "SKIPPED",
  RETRYING = "RETRYING",
}

// ==========================================
// 2. TRIGGER & STEP SCHEMAS
// ==========================================

export const WorkflowTriggerSchema = z.object({
  id: z.string().optional(),
  triggerType: z.nativeEnum(WorkflowTriggerTypeEnum),
  eventName: z.string().optional(),
  cronExpression: z.string().optional(),
  config: z.record(z.string(), z.any()).optional(),
  enabled: z.boolean().default(true),
});

export const WorkflowStepRetryPolicySchema = z.object({
  maxRetries: z.number().int().nonnegative().default(3),
  backoffSeconds: z.number().int().nonnegative().default(60),
});

export const WorkflowStepSchema = z.object({
  id: z.string(),
  stepNumber: z.number().int().positive(),
  name: z.string().min(1),
  stepType: z.nativeEnum(WorkflowStepTypeEnum),
  action: z.string().min(1),
  config: z.record(z.string(), z.any()).optional(),
  nextStepId: z.string().nullable().optional(),
  onFailureStepId: z.string().nullable().optional(),
  retryPolicy: WorkflowStepRetryPolicySchema.optional(),
});

export const WorkflowRulesSchema = z.object({
  code: z.string().optional(),
  description: z.string().optional(),
  version: z.number().int().positive().default(1),
  triggers: z.array(WorkflowTriggerSchema).default([]),
  steps: z.array(WorkflowStepSchema).default([]),
  metadata: z.record(z.string(), z.any()).optional(),
});

// ==========================================
// 3. WORKFLOW DEFINITION SCHEMAS
// ==========================================

export const CreateWorkflowSchema = z.object({
  name: z.string().min(2, "Workflow name must be at least 2 characters"),
  workflowType: z.nativeEnum(WorkflowTypeEnum),
  rules: WorkflowRulesSchema,
  isActive: z.boolean().default(true),
});

export const UpdateWorkflowSchema = z.object({
  name: z.string().min(2).optional(),
  workflowType: z.nativeEnum(WorkflowTypeEnum).optional(),
  rules: WorkflowRulesSchema.optional(),
  isActive: z.boolean().optional(),
  version: z.number().int().positive().optional(),
});

export const WorkflowQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
  search: z.string().optional(),
  workflowType: z.nativeEnum(WorkflowTypeEnum).optional(),
  isActive: z.boolean().optional(),
});

// ==========================================
// 4. WORKFLOW VERSION SCHEMAS
// ==========================================

export const CreateWorkflowVersionSchema = z.object({
  rules: WorkflowRulesSchema,
  description: z.string().optional(),
});

export const WorkflowVersionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
});

// ==========================================
// 5. WORKFLOW TRIGGER SCHEMAS
// ==========================================

export const CreateWorkflowTriggerSchema = WorkflowTriggerSchema;

export const UpdateWorkflowTriggerSchema = z.object({
  eventName: z.string().optional(),
  cronExpression: z.string().optional(),
  config: z.record(z.string(), z.any()).optional(),
  enabled: z.boolean().optional(),
});

// ==========================================
// 6. WORKFLOW STEP SCHEMAS
// ==========================================

export const CreateWorkflowStepSchema = WorkflowStepSchema;

export const UpdateWorkflowStepSchema = z.object({
  name: z.string().optional(),
  stepType: z.nativeEnum(WorkflowStepTypeEnum).optional(),
  action: z.string().optional(),
  config: z.record(z.string(), z.any()).optional(),
  nextStepId: z.string().nullable().optional(),
  onFailureStepId: z.string().nullable().optional(),
  retryPolicy: WorkflowStepRetryPolicySchema.optional(),
});

// ==========================================
// 7. WORKFLOW EXECUTION SCHEMAS
// ==========================================

export const CreateWorkflowExecutionSchema = z.object({
  definitionId: z.string().min(1),
  triggerEvent: z.string().min(1),
  payload: z.record(z.string(), z.any()).optional(),
});

export const WorkflowExecutionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
  definitionId: z.string().optional(),
  status: z.nativeEnum(WorkflowStatusEnum).optional(),
  triggerEvent: z.string().optional(),
});

export const UpdateExecutionStepSchema = z.object({
  stepId: z.string().min(1),
  stepName: z.string().min(1),
  status: z.nativeEnum(WorkflowExecutionStatusEnum),
  input: z.record(z.string(), z.any()).optional(),
  output: z.record(z.string(), z.any()).optional(),
  error: z.string().optional(),
  durationMs: z.number().optional(),
  retryCount: z.number().int().nonnegative().optional(),
});

// ==========================================
// 8. INFERRED TYPESCRIPT TYPES
// ==========================================

export type WorkflowTrigger = z.infer<typeof WorkflowTriggerSchema>;
export type WorkflowStepRetryPolicy = z.infer<typeof WorkflowStepRetryPolicySchema>;
export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;
export type WorkflowRules = z.infer<typeof WorkflowRulesSchema>;

export type CreateWorkflowInput = z.infer<typeof CreateWorkflowSchema>;
export type UpdateWorkflowInput = z.infer<typeof UpdateWorkflowSchema>;
export type WorkflowQueryInput = z.infer<typeof WorkflowQuerySchema>;

export type CreateWorkflowVersionInput = z.infer<typeof CreateWorkflowVersionSchema>;
export type WorkflowVersionQueryInput = z.infer<typeof WorkflowVersionQuerySchema>;

export type CreateWorkflowTriggerInput = z.infer<typeof CreateWorkflowTriggerSchema>;
export type UpdateWorkflowTriggerInput = z.infer<typeof UpdateWorkflowTriggerSchema>;

export type CreateWorkflowStepInput = z.infer<typeof CreateWorkflowStepSchema>;
export type UpdateWorkflowStepInput = z.infer<typeof UpdateWorkflowStepSchema>;

export type CreateWorkflowExecutionInput = z.infer<typeof CreateWorkflowExecutionSchema>;
export type WorkflowExecutionQueryInput = z.infer<typeof WorkflowExecutionQuerySchema>;
export type UpdateExecutionStepInput = z.infer<typeof UpdateExecutionStepSchema>;

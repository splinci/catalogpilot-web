/**
 * ============================================================================
 * Ondrio Commerce OS — Reporting & Business Intelligence DTO Schemas
 * ============================================================================
 * Specification Reference: M10-001 / BSD-008 / DAT-001
 * ============================================================================
 */

import { z } from "zod";

// ============================================================================
// 1. ENUMS & CONSTANTS
// ============================================================================

export const ReportFrequencyEnum = z.enum([
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "QUARTERLY",
]);

export const ReportFormatEnum = z.enum([
  "PDF",
  "CSV",
  "EXCEL",
  "JSON",
]);

export const ReportDomainEnum = z.enum([
  "EXECUTIVE_DASHBOARD",
  "SALES",
  "INVENTORY",
  "PURCHASING",
  "FINANCE",
  "CRM",
  "AI_INTELLIGENCE",
]);

// ============================================================================
// 2. DTO SCHEMAS
// ============================================================================

export const DateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const DashboardQuerySchema = DateRangeSchema.extend({
  warehouseId: z.string().optional(),
  categoryId: z.string().optional(),
});

export const SalesReportQuerySchema = DateRangeSchema.extend({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  customerId: z.string().optional(),
  productId: z.string().optional(),
  categoryId: z.string().optional(),
  salespersonId: z.string().optional(),
  format: ReportFormatEnum.optional(),
});

export const InventoryReportQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  warehouseId: z.string().optional(),
  categoryId: z.string().optional(),
  reorderOnly: z.coerce.boolean().optional(),
  format: ReportFormatEnum.optional(),
});

export const PurchasingReportQuerySchema = DateRangeSchema.extend({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  supplierId: z.string().optional(),
  status: z.string().optional(),
  format: ReportFormatEnum.optional(),
});

export const FinanceReportQuerySchema = DateRangeSchema.extend({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  customerId: z.string().optional(),
  status: z.string().optional(),
  overdueOnly: z.coerce.boolean().optional(),
  format: ReportFormatEnum.optional(),
});

export const CRMReportQuerySchema = DateRangeSchema.extend({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  segment: z.string().optional(),
  inactiveDays: z.coerce.number().int().optional(),
  creditRiskOnly: z.coerce.boolean().optional(),
  format: ReportFormatEnum.optional(),
});

export const ExecutiveKPIQuerySchema = DateRangeSchema.extend({
  domain: ReportDomainEnum.optional(),
  comparePreviousPeriod: z.coerce.boolean().optional(),
});

export const ScheduledReportSchema = z.object({
  reportName: z.string().min(2, "Report name is required"),
  domain: ReportDomainEnum,
  frequency: ReportFrequencyEnum,
  format: ReportFormatEnum.optional().default("PDF"),
  cronExpr: z.string().optional(),
  recipients: z.array(z.string().email("Invalid email recipient")).min(1, "At least one recipient email is required"),
  parameters: z.record(z.string(), z.unknown()).optional(),
  isEnabled: z.boolean().optional().default(true),
});

export const ScheduledReportQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  domain: ReportDomainEnum.optional(),
  frequency: ReportFrequencyEnum.optional(),
  isEnabled: z.coerce.boolean().optional(),
});

// ============================================================================
// 3. INFERRED TYPE INTERFACES
// ============================================================================

export type ReportFrequency = z.infer<typeof ReportFrequencyEnum>;
export type ReportFormat = z.infer<typeof ReportFormatEnum>;
export type ReportDomain = z.infer<typeof ReportDomainEnum>;

export type DateRangeInput = z.infer<typeof DateRangeSchema>;
export type DashboardQueryInput = z.infer<typeof DashboardQuerySchema>;
export type SalesReportQueryInput = z.infer<typeof SalesReportQuerySchema>;
export type InventoryReportQueryInput = z.infer<typeof InventoryReportQuerySchema>;
export type PurchasingReportQueryInput = z.infer<typeof PurchasingReportQuerySchema>;
export type FinanceReportQueryInput = z.infer<typeof FinanceReportQuerySchema>;
export type CRMReportQueryInput = z.infer<typeof CRMReportQuerySchema>;
export type ExecutiveKPIQueryInput = z.infer<typeof ExecutiveKPIQuerySchema>;
export type ScheduledReportInput = z.infer<typeof ScheduledReportSchema>;
export type ScheduledReportQueryInput = z.infer<typeof ScheduledReportQuerySchema>;

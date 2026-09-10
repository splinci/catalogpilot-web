/**
 * ============================================================================
 * Splinci Commerce OS — System Settings Service
 * ============================================================================
 * Specification Reference: M12-002 / OPS-001 / SEC-001 / DAT-001
 * Domain: Tenant System Settings & Configuration Service
 * Note: Applies SystemSettingPolicy, delegates persistence to OperationsRepository.
 * ============================================================================
 */

import { OperationsRepository, operationsRepository } from "../../repositories/operations.repository";
import { SystemSettingPolicy } from "./operations.policy";
import { UpsertSystemSettingDto } from "../../types/operations.dto";

export class SystemSettingsService {
  constructor(private readonly opsRepo: OperationsRepository = operationsRepository) {}

  /**
   * List all system settings for tenant.
   */
  async listSettings(companyId: string) {
    if (!companyId) {
      throw new Error("companyId is required to list system settings");
    }
    return this.opsRepo.getSystemSettings(companyId);
  }

  /**
   * Get specific system setting by key for tenant.
   */
  async getSetting(companyId: string, key: string) {
    if (!companyId || !key) {
      throw new Error("companyId and key are required to get system setting");
    }
    return this.opsRepo.getSystemSettingByKey(companyId, key);
  }

  /**
   * Upsert system setting for tenant.
   * Validates policy key format and payload before mutating.
   */
  async upsertSetting(dto: UpsertSystemSettingDto, userId?: string) {
    const { companyId, key, value } = dto;
    if (!companyId) {
      throw new Error("companyId is required to upsert system setting");
    }

    if (!SystemSettingPolicy.isValidKey(key)) {
      throw new Error(`Invalid system setting key format: '${key}'. Must be uppercase alphanumeric with underscores (3-100 characters).`);
    }

    if (!SystemSettingPolicy.isValidValue(value)) {
      throw new Error("System setting value must be a non-empty string up to 10,000 characters.");
    }

    return this.opsRepo.upsertSystemSetting(dto, userId);
  }
}

export const systemSettingsService = new SystemSettingsService();

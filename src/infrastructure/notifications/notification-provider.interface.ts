/**
 * ============================================================================
 * Splinci Commerce OS — Notification Provider Interface
 * ============================================================================
 * Specification Reference: CI-003 / PROVIDER-001 / INFRA-001
 * Enterprise Extensible Notification Provider Abstraction
 * ============================================================================
 */

import { AlertEventDto, AlertDeliveryResultDto } from "../../types/operations-alert.dto";

export interface NotificationProvider {
  getProviderName(): string;
  validateConfiguration(): boolean;
  send(event: AlertEventDto): Promise<AlertDeliveryResultDto>;
}

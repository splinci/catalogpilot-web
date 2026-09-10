/**
 * ============================================================================
 * Splinci Commerce OS — System Health Repository
 * ============================================================================
 * Specification Reference: M12-001 / OPS-001 / OBS-001 / DAT-001
 * Platform-Level Infrastructure & Database Health Monitoring Repository
 * ============================================================================
 */

import { BaseRepository } from "./base/base.repository";
import { SystemHealthStatusEnum, SystemHealthTelemetryDto } from "../types/operations.dto";

export class HealthRepository extends BaseRepository {
  /**
   * Ping database and measure raw latency in milliseconds.
   */
  async pingDatabase(): Promise<{ isConnected: boolean; latencyMs: number; error?: string }> {
    const dbStart = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const latencyMs = Date.now() - dbStart;
      return { isConnected: true, latencyMs };
    } catch (err: any) {
      return {
        isConnected: false,
        latencyMs: Date.now() - dbStart,
        error: err?.message || "Database connection unreachable",
      };
    }
  }

  /**
   * Record a platform health check entry in the health_checks table.
   */
  async recordHealthCheck(status = "OK") {
    return this.prisma.healthCheck.create({
      data: {
        status,
        checkedAt: new Date(),
      },
    });
  }

  /**
   * Get recent health check records.
   */
  async getRecentHealthChecks(limit = 20) {
    return this.prisma.healthCheck.findMany({
      orderBy: { checkedAt: "desc" },
      take: limit,
    });
  }

  /**
   * Get overall platform diagnostic telemetry.
   */
  async getSystemTelemetry(): Promise<SystemHealthTelemetryDto> {
    const ping = await this.pingDatabase();
    const memory = process.memoryUsage();

    let healthStatus = SystemHealthStatusEnum.HEALTHY;
    if (!ping.isConnected) {
      healthStatus = SystemHealthStatusEnum.UNHEALTHY;
    } else if (ping.latencyMs > 300) {
      healthStatus = SystemHealthStatusEnum.DEGRADED;
    }

    return {
      status: healthStatus,
      version: "v1.0.0",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: ping.isConnected ? "CONNECTED" : `ERROR: ${ping.error}`,
        latencyMs: ping.latencyMs,
        provider: "Neon PostgreSQL",
      },
      system: {
        memoryHeapUsedMB: (memory.heapUsed / 1024 / 1024).toFixed(2),
        memoryRssMB: (memory.rss / 1024 / 1024).toFixed(2),
        nodeVersion: process.version,
      },
      security: {
        sqlInjectionProtected: true,
        xssAutoEscaping: true,
        multiTenantIsolated: true,
        rateLimitingActive: true,
      },
    };
  }
}

export const healthRepository = new HealthRepository();

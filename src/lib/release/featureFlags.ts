export interface FeatureFlag {
  key: string;
  enabled: boolean;
  targetTenantIds?: string[];
  killSwitchActive: boolean;
}

const flags = new Map<string, FeatureFlag>();

export function setFeatureFlag(key: string, enabled: boolean, targetTenantIds?: string[]): FeatureFlag {
  const flag: FeatureFlag = {
    key,
    enabled,
    targetTenantIds,
    killSwitchActive: false,
  };
  flags.set(key, flag);
  return flag;
}

export function activateKillSwitch(key: string): void {
  const flag = flags.get(key);
  if (flag) {
    flag.killSwitchActive = true;
    flag.enabled = false;
  }
}

export function isFeatureEnabled(key: string, companyId?: string): boolean {
  const flag = flags.get(key);
  if (!flag || !flag.enabled || flag.killSwitchActive) return false;

  if (flag.targetTenantIds && flag.targetTenantIds.length > 0) {
    if (!companyId || !flag.targetTenantIds.includes(companyId)) {
      return false;
    }
  }

  return true;
}

export function clearFeatureFlags(): void {
  flags.clear();
}

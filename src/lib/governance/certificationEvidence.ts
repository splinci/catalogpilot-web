import { getTenantControlEvidence, ControlEvidenceRecord } from "../audit/evidenceCollector";

export interface MasterEvidencePackage {
  companyId: string;
  assembledAt: string;
  totalEvidenceRecords: number;
  evidenceRecords: ControlEvidenceRecord[];
}

export function assembleMasterEvidencePackage(companyId = "SYSTEM"): MasterEvidencePackage {
  const records = getTenantControlEvidence(companyId);

  return {
    companyId,
    assembledAt: new Date().toISOString(),
    totalEvidenceRecords: records.length,
    evidenceRecords: records,
  };
}

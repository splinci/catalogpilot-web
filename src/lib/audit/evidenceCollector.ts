import crypto from "crypto";

export interface ControlEvidenceRecord {
  evidenceId: string;
  controlId: string;
  companyId: string;
  timestamp: string;
  actorUserId: string;
  source: string;
  payloadHash: string;
  payloadSummary: any;
}

const evidenceLog: ControlEvidenceRecord[] = [];

export function captureControlEvidence(
  controlId: string,
  companyId: string,
  actorUserId: string,
  source: string,
  payloadSummary: any
): ControlEvidenceRecord {
  const payloadString = JSON.stringify(payloadSummary);
  const payloadHash = crypto.createHash("sha256").update(payloadString).digest("hex");

  const record: ControlEvidenceRecord = {
    evidenceId: `evd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    controlId,
    companyId,
    timestamp: new Date().toISOString(),
    actorUserId,
    source,
    payloadHash,
    payloadSummary,
  };

  evidenceLog.unshift(record);
  if (evidenceLog.length > 200) {
    evidenceLog.pop();
  }

  return record;
}

export function getTenantControlEvidence(companyId?: string, controlId?: string): ControlEvidenceRecord[] {
  return evidenceLog.filter((evt) => {
    if (companyId && evt.companyId !== companyId) return false;
    if (controlId && evt.controlId !== controlId) return false;
    return true;
  });
}

export function clearEvidenceLog(): void {
  evidenceLog.length = 0;
}

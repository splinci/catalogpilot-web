export type ChangeClassification = "STANDARD" | "NORMAL" | "EMERGENCY";
export type ChangeStatus = "PROPOSED" | "REVIEWED" | "APPROVED" | "PROMOTED" | "REJECTED" | "ROLLED_BACK";

export interface ProductionChangeRecord {
  changeId: string;
  classification: ChangeClassification;
  title: string;
  proposedByUserId: string;
  approvedByUserId?: string;
  status: ChangeStatus;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

const changeStore = new Map<string, ProductionChangeRecord>();

export function proposeChange(
  classification: ChangeClassification,
  title: string,
  proposedByUserId: string,
  companyId?: string
): ProductionChangeRecord {
  const record: ProductionChangeRecord = {
    changeId: `chg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    classification,
    title,
    proposedByUserId,
    status: classification === "STANDARD" ? "APPROVED" : "PROPOSED",
    companyId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  changeStore.set(record.changeId, record);
  return record;
}

export function approveChange(changeId: string, approvingUserId: string): ProductionChangeRecord {
  const record = changeStore.get(changeId);
  if (!record) throw new Error(`Change '${changeId}' not found.`);

  // Segregation of duties: Proposer cannot approve non-standard changes
  if (record.classification !== "STANDARD" && record.proposedByUserId === approvingUserId) {
    throw new Error(
      `SEGREGATION_OF_DUTIES_VIOLATION: Proposer '${approvingUserId}' cannot self-approve ${record.classification} change '${changeId}'.`
    );
  }

  record.status = "APPROVED";
  record.approvedByUserId = approvingUserId;
  record.updatedAt = new Date().toISOString();

  return record;
}

export function clearChangeStore(): void {
  changeStore.clear();
}

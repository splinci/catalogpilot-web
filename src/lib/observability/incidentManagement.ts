import { captureControlEvidence } from "../audit/evidenceCollector";

export type IncidentSeverity = "SEV_1" | "SEV_2" | "SEV_3" | "SEV_4";
export type IncidentStatus = "OPEN" | "INVESTIGATING" | "IDENTIFIED" | "MONITORING" | "RESOLVED" | "CLOSED";

export interface IncidentRecord {
  incidentId: string;
  companyId: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  leadUserId: string;
  createdAt: string;
  resolvedAt?: string;
  postIncidentReviewSummary?: string;
}

const incidentStore = new Map<string, IncidentRecord>();

export function declareIncident(
  companyId: string,
  title: string,
  severity: IncidentSeverity,
  leadUserId: string
): IncidentRecord {
  const incident: IncidentRecord = {
    incidentId: `inc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    companyId,
    title,
    severity,
    status: "OPEN",
    leadUserId,
    createdAt: new Date().toISOString(),
  };

  incidentStore.set(incident.incidentId, incident);
  return incident;
}

export function updateIncidentStatus(incidentId: string, targetStatus: IncidentStatus): IncidentRecord {
  const incident = incidentStore.get(incidentId);
  if (!incident) throw new Error(`Incident '${incidentId}' not found.`);

  incident.status = targetStatus;
  if (targetStatus === "RESOLVED") {
    incident.resolvedAt = new Date().toISOString();
  }

  return incident;
}

export function completePostIncidentReview(
  incidentId: string,
  summary: string,
  completedByUserId: string
): IncidentRecord {
  const incident = incidentStore.get(incidentId);
  if (!incident) throw new Error(`Incident '${incidentId}' not found.`);

  incident.status = "CLOSED";
  incident.postIncidentReviewSummary = summary;

  captureControlEvidence("CTRL-SEC-001", incident.companyId, completedByUserId, "Post-Incident Review", {
    incidentId,
    severity: incident.severity,
    summary,
  });

  return incident;
}

export function clearIncidentStore(): void {
  incidentStore.clear();
}

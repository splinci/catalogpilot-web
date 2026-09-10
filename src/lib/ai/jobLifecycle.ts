export type AiJobState =
  | "PENDING"
  | "VALIDATING"
  | "QUEUED"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "RETRYING"
  | "CANCELLED"
  | "DEAD_LETTER";

const VALID_AI_JOB_TRANSITIONS: Record<AiJobState, AiJobState[]> = {
  PENDING: ["VALIDATING", "CANCELLED"],
  VALIDATING: ["QUEUED", "FAILED", "CANCELLED"],
  QUEUED: ["RUNNING", "CANCELLED"],
  RUNNING: ["COMPLETED", "FAILED", "RETRYING"],
  RETRYING: ["RUNNING", "FAILED", "DEAD_LETTER"],
  COMPLETED: [],
  FAILED: [],
  CANCELLED: [],
  DEAD_LETTER: [],
};

export function validateAiJobTransition(current: AiJobState, target: AiJobState): void {
  if (current === target) return;

  const allowed = VALID_AI_JOB_TRANSITIONS[current] || [];
  if (!allowed.includes(target)) {
    throw new Error(`INVALID_AI_JOB_TRANSITION: Prohibited transition from '${current}' to '${target}'.`);
  }
}

import { captureControlEvidence } from "../audit/evidenceCollector";

export type ExerciseState = "PLANNED" | "RUNNING" | "VALIDATING" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface DisasterRecoveryExercise {
  exerciseId: string;
  scenarioId: string;
  companyId: string;
  startedAt: string;
  completedAt?: string;
  recoveryTimeSeconds?: number;
  estimatedDataLossSeconds?: number;
  status: ExerciseState;
  findings?: string;
  approvedBy?: string;
}

const exercises = new Map<string, DisasterRecoveryExercise>();

export function createDrExercise(scenarioId: string, companyId: string): DisasterRecoveryExercise {
  const exercise: DisasterRecoveryExercise = {
    exerciseId: `dr_ex_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    scenarioId,
    companyId,
    startedAt: new Date().toISOString(),
    status: "PLANNED",
  };

  exercises.set(exercise.exerciseId, exercise);
  return exercise;
}

export function completeDrExercise(
  exerciseId: string,
  recoveryTimeSeconds: number,
  estimatedDataLossSeconds: number,
  approvedBy: string,
  findings = "Recovery objectives verified"
): DisasterRecoveryExercise {
  const exercise = exercises.get(exerciseId);
  if (!exercise) throw new Error(`DR Exercise '${exerciseId}' not found.`);

  exercise.status = "COMPLETED";
  exercise.completedAt = new Date().toISOString();
  exercise.recoveryTimeSeconds = recoveryTimeSeconds;
  exercise.estimatedDataLossSeconds = estimatedDataLossSeconds;
  exercise.approvedBy = approvedBy;
  exercise.findings = findings;

  captureControlEvidence("CTRL-REL-001", exercise.companyId, approvedBy, "Disaster Recovery Exercise", {
    exerciseId,
    recoveryTimeSeconds,
    estimatedDataLossSeconds,
  });

  return exercise;
}

export function clearExerciseStore(): void {
  exercises.clear();
}

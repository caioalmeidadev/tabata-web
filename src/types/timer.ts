import type { IntervalType, Workout } from "./workout";

export type TimerStatus =
  | "idle"
  | "running"
  | "paused"
  | "finished";

export interface FlattenedStep {
  index: number;
  id: string;
  name: string;
  type: IntervalType;
  duration: number; // in seconds
  cycle: number;
  totalCycles: number;
  round: number;
  totalRounds: number;
  repeat: number;
  totalRepeats: number;
  intervalIndex: number;
}

export interface TimerState {
  status: TimerStatus;

  workout: Workout | null;

  currentCycle: number;
  currentRound: number;
  currentRepeat: number;
  currentInterval: number;

  /** Index in the flattened steps timeline */
  currentStepIndex: number;
  steps: FlattenedStep[];

  startedAt: number | null;
  endsAt: number | null;

  remainingMs: number;
}

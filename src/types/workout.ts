export type IntervalType =
  | "prepare"
  | "work"
  | "rest"
  | "cooldown";

export interface WorkoutInterval {
  id: string;
  name: string;
  type: IntervalType;
  duration: number;
}

export interface WorkoutRound {
  id: string;
  name: string;
  repeats: number;
  intervals: WorkoutInterval[];
}

export interface Workout {
  id: string;
  name: string;
  color: string;

  prepareDuration: number;

  rounds: WorkoutRound[];

  cycles: number;

  restBetweenCycles: number;

  isPreset?: boolean;
  createdAt: string;
  updatedAt: string;
}

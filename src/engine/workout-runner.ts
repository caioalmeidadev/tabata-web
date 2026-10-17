import type { FlattenedStep } from "@/types/timer";
import type { Workout } from "@/types/workout";

/**
 * Generates an ordered, flat list of steps from a Workout configuration.
 * Order:
 * 1. Prepare (if prepareDuration > 0)
 * 2. For each cycle (1..cycles):
 *    - For each round (1..rounds.length):
 *      - For each repeat (1..round.repeats):
 *        - For each interval (1..round.intervals.length)
 *    - If not last cycle and restBetweenCycles > 0:
 *      - Rest between cycles step
 */
export function buildWorkoutSteps(workout: Workout): FlattenedStep[] {
  const steps: FlattenedStep[] = [];
  const totalCycles = Math.max(1, workout.cycles || 1);
  const totalRounds = Math.max(1, workout.rounds.length);

  const firstRoundRepeats = workout.rounds[0]?.repeats ?? 1;

  if (workout.prepareDuration > 0) {
    steps.push({
      index: steps.length,
      id: `${workout.id}-prepare`,
      name: "Prepare-se",
      type: "prepare",
      duration: workout.prepareDuration,
      cycle: 1,
      totalCycles,
      round: 1,
      totalRounds,
      repeat: 1,
      totalRepeats: firstRoundRepeats,
      intervalIndex: 0,
    });
  }

  for (let cycle = 1; cycle <= totalCycles; cycle++) {
    for (let rIdx = 0; rIdx < workout.rounds.length; rIdx++) {
      const round = workout.rounds[rIdx];
      const totalRepeats = Math.max(1, round.repeats || 1);

      for (let repeat = 1; repeat <= totalRepeats; repeat++) {
        for (let iIdx = 0; iIdx < round.intervals.length; iIdx++) {
          const interval = round.intervals[iIdx];
          if (interval.duration <= 0) continue;

          steps.push({
            index: steps.length,
            id: `${workout.id}-c${cycle}-r${rIdx + 1}-rep${repeat}-i${iIdx}`,
            name: interval.name || interval.type.toUpperCase(),
            type: interval.type,
            duration: interval.duration,
            cycle,
            totalCycles,
            round: rIdx + 1,
            totalRounds,
            repeat,
            totalRepeats,
            intervalIndex: iIdx,
          });
        }
      }
    }

    if (cycle < totalCycles && workout.restBetweenCycles > 0) {
      const lastRound = workout.rounds[workout.rounds.length - 1];
      steps.push({
        index: steps.length,
        id: `${workout.id}-c${cycle}-rest-between-cycles`,
        name: "Descanso entre Ciclos",
        type: "rest",
        duration: workout.restBetweenCycles,
        cycle,
        totalCycles,
        round: totalRounds,
        totalRounds,
        repeat: lastRound?.repeats ?? 1,
        totalRepeats: lastRound?.repeats ?? 1,
        intervalIndex: 0,
      });
    }
  }

  return steps;
}

export function getTotalWorkoutDurationSeconds(workout: Workout): number {
  const steps = buildWorkoutSteps(workout);
  return steps.reduce((acc, step) => acc + step.duration, 0);
}

export function getRemainingWorkoutMs(
  steps: FlattenedStep[],
  currentStepIndex: number,
  currentStepRemainingMs: number
): number {
  if (!steps.length || currentStepIndex >= steps.length) return 0;

  let futureSeconds = 0;
  for (let i = currentStepIndex + 1; i < steps.length; i++) {
    futureSeconds += steps[i].duration;
  }

  return Math.max(0, currentStepRemainingMs) + futureSeconds * 1000;
}

export function getCurrentStep(
  steps: FlattenedStep[],
  currentStepIndex: number
): FlattenedStep | null {
  return steps[currentStepIndex] ?? null;
}

export function getNextStep(
  steps: FlattenedStep[],
  currentStepIndex: number
): FlattenedStep | null {
  return steps[currentStepIndex + 1] ?? null;
}

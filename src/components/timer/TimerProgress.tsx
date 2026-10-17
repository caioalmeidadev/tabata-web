"use client";

interface TimerProgressProps {
  stepRemainingMs: number;
  stepDurationSec: number;
  currentStepIndex: number;
  totalSteps: number;
}

export function TimerProgress({
  stepRemainingMs,
  stepDurationSec,
  currentStepIndex,
  totalSteps,
}: TimerProgressProps) {
  const stepTotalMs = Math.max(1, stepDurationSec * 1000);
  const stepProgressPct = Math.min(
    100,
    Math.max(0, ((stepTotalMs - stepRemainingMs) / stepTotalMs) * 100)
  );

  const workoutProgressPct =
    totalSteps > 0
      ? Math.min(100, Math.max(0, ((currentStepIndex + stepProgressPct / 100) / totalSteps) * 100))
      : 0;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-2">
      <div className="h-3 w-full overflow-hidden rounded-full bg-black/25 p-0.5">
        <div
          className="h-full rounded-full bg-current transition-[width] duration-75"
          style={{ width: `${stepProgressPct}%` }}
        />
      </div>
      <div className="flex items-center justify-between font-condensed text-xs font-bold uppercase tracking-wider opacity-80">
        <span>
          ETAPA {currentStepIndex + 1} DE {totalSteps}
        </span>
        <span>{Math.round(workoutProgressPct)}% CONCLUÍDO</span>
      </div>
    </div>
  );
}

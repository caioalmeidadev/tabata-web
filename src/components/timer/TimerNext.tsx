"use client";

import { INTERVAL_TYPE_META } from "@/constants/theme";
import { formatSeconds } from "@/lib/utils";
import type { FlattenedStep } from "@/types/timer";

interface TimerNextProps {
  nextStep: FlattenedStep | null;
}

export function TimerNext({ nextStep }: TimerNextProps) {
  return (
    <div className="mx-auto flex w-full max-w-md items-center justify-between rounded-2xl bg-black/20 px-5 py-3 backdrop-blur-sm">
      <span className="font-condensed text-sm font-bold uppercase tracking-widest opacity-80">
        PRÓXIMO
      </span>

      {nextStep ? (
        <div className="flex items-center gap-2.5">
          <span className="font-condensed text-base font-bold uppercase tracking-wider">
            {INTERVAL_TYPE_META[nextStep.type].label} • {nextStep.name}
          </span>
          <span className="rounded-lg bg-black/25 px-2.5 py-0.5 font-display text-base">
            {formatSeconds(nextStep.duration)}
          </span>
        </div>
      ) : (
        <span className="font-condensed text-base font-bold uppercase tracking-wider">
          FIM DO TREINO
        </span>
      )}
    </div>
  );
}

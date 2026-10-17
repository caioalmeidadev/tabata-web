"use client";

import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Square,
} from "lucide-react";
import type { TimerStatus } from "@/types/timer";

interface TimerControlsProps {
  status: TimerStatus;
  canPrevious: boolean;
  onPrevious: () => void;
  onPause: () => void;
  onResume: () => void;
  onNext: () => void;
  onStop: () => void;
}

export function TimerControls({
  status,
  canPrevious,
  onPrevious,
  onPause,
  onResume,
  onNext,
  onStop,
}: TimerControlsProps) {
  const isPaused = status === "paused";

  return (
    <div className="mx-auto flex w-full max-w-md items-center justify-center gap-4 py-2 md:gap-6">
      <button
        type="button"
        onClick={onStop}
        aria-label="Parar treino"
        className="flex h-13 w-13 items-center justify-center rounded-2xl bg-black/25 transition hover:bg-black/40 active:scale-95 cursor-pointer"
      >
        <Square className="h-5 w-5 fill-current" />
      </button>

      <button
        type="button"
        onClick={onPrevious}
        disabled={!canPrevious}
        aria-label="Intervalo anterior"
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/25 transition hover:bg-black/40 disabled:opacity-40 active:scale-95 cursor-pointer"
      >
        <SkipBack className="h-6 w-6 fill-current" />
      </button>

      <button
        type="button"
        onClick={isPaused ? onResume : onPause}
        aria-label={isPaused ? "Continuar treino" : "Pausar treino"}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0A0A0A] text-white shadow-2xl transition hover:scale-105 active:scale-95 cursor-pointer"
      >
        {isPaused ? (
          <Play className="h-9 w-9 translate-x-0.5 fill-current text-[#83FF36]" />
        ) : (
          <Pause className="h-9 w-9 fill-current" />
        )}
      </button>

      <button
        type="button"
        onClick={onNext}
        aria-label="Próximo intervalo"
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/25 transition hover:bg-black/40 active:scale-95 cursor-pointer"
      >
        <SkipForward className="h-6 w-6 fill-current" />
      </button>
    </div>
  );
}

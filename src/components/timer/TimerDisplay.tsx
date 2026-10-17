"use client";

import { INTERVAL_TYPE_META } from "@/constants/theme";
import { formatMs } from "@/lib/utils";
import type { IntervalType } from "@/types/workout";

interface TimerDisplayProps {
  intervalType: IntervalType;
  intervalName: string;
  remainingMs: number;
}

export function TimerDisplay({
  intervalType,
  intervalName,
  remainingMs,
}: TimerDisplayProps) {
  const meta = INTERVAL_TYPE_META[intervalType];

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center select-none">
      <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-black/15 px-5 py-1.5 backdrop-blur-sm">
        <span className="font-condensed text-2xl font-bold uppercase tracking-[0.2em] md:text-3xl">
          {meta.label}
        </span>
      </div>

      <p className="mb-2 font-condensed text-lg font-semibold uppercase tracking-wider opacity-85 md:text-2xl">
        {intervalName}
      </p>

      <div
        className="font-display text-[7.5rem] leading-[0.9] tracking-tight sm:text-[10rem] md:text-[13rem] lg:text-[15rem]"
        aria-live="polite"
      >
        {formatMs(remainingMs)}
      </div>
    </div>
  );
}

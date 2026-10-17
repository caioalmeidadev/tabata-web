"use client";

interface TimerStatsProps {
  currentRepeat: number;
  totalRepeats: number;
  currentCycle: number;
  totalCycles: number;
}

export function TimerStats({
  currentRepeat,
  totalRepeats,
  currentCycle,
  totalCycles,
}: TimerStatsProps) {
  const remainingRepeats = Math.max(0, totalRepeats - currentRepeat);
  const remainingCycles = Math.max(0, totalCycles - currentCycle);

  return (
    <div className="mx-auto grid w-full max-w-md grid-cols-2 gap-3">
      <div className="flex flex-col items-center rounded-2xl bg-[#0A0A0A]/85 px-4 py-3 text-white shadow-lg border border-[#249CFF]/40">
        <span className="font-condensed text-xs font-bold uppercase tracking-widest text-[#249CFF]">
          REPEATS
        </span>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="font-display text-3xl text-white md:text-4xl">
            {currentRepeat}
            <span className="text-lg text-[#9CA3AF]">/{totalRepeats}</span>
          </span>
        </div>
        <span className="font-condensed text-xs uppercase tracking-wider text-[#9CA3AF]">
          {remainingRepeats} restantes
        </span>
      </div>

      <div className="flex flex-col items-center rounded-2xl bg-[#0A0A0A]/85 px-4 py-3 text-white shadow-lg border border-[#FFC62E]/40">
        <span className="font-condensed text-xs font-bold uppercase tracking-widest text-[#FFC62E]">
          CYCLES
        </span>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="font-display text-3xl text-white md:text-4xl">
            {currentCycle}
            <span className="text-lg text-[#9CA3AF]">/{totalCycles}</span>
          </span>
        </div>
        <span className="font-condensed text-xs uppercase tracking-wider text-[#9CA3AF]">
          {remainingCycles} restantes
        </span>
      </div>
    </div>
  );
}

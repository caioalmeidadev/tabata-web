"use client";

import { Minus, Plus, Repeat } from "lucide-react";

interface RepeatsInputProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (nextRepeats: number) => void;
}

export function RepeatsInput({
  value,
  min = 1,
  max = 50,
  onChange,
}: RepeatsInputProps) {
  const handleAdjust = (delta: number) => {
    onChange(Math.min(max, Math.max(min, value + delta)));
  };

  return (
    <div className="flex items-center gap-2 rounded-xl border border-[#249CFF]/30 bg-[#0A0A0A]/60 px-2.5 py-1.5">
      <Repeat className="h-4 w-4 text-[#249CFF]" />
      <span className="font-condensed text-xs font-bold uppercase tracking-wider text-[#249CFF]">
        Repeats
      </span>

      <button
        type="button"
        onClick={() => handleAdjust(-1)}
        disabled={value <= min}
        aria-label="Diminuir repetições"
        className="flex h-7 w-7 items-center justify-center rounded-md bg-[#232323] text-white transition hover:bg-white/15 disabled:opacity-40 cursor-pointer"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <span className="min-w-6 text-center font-display text-lg text-white">
        {value}
      </span>

      <button
        type="button"
        onClick={() => handleAdjust(1)}
        disabled={value >= max}
        aria-label="Aumentar repetições"
        className="flex h-7 w-7 items-center justify-center rounded-md bg-[#232323] text-white transition hover:bg-white/15 disabled:opacity-40 cursor-pointer"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

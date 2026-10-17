"use client";

import { Minus, Plus, RefreshCw } from "lucide-react";

interface CyclesInputProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (nextCycles: number) => void;
}

export function CyclesInput({
  value,
  min = 1,
  max = 30,
  onChange,
}: CyclesInputProps) {
  const handleAdjust = (delta: number) => {
    onChange(Math.min(max, Math.max(min, value + delta)));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-condensed text-xs font-bold uppercase tracking-wider text-[#FFC62E]">
        Ciclos (Cycles)
      </span>
      <div className="flex items-center gap-2 rounded-xl border border-[#FFC62E]/30 bg-[#232323] p-1.5">
        <button
          type="button"
          onClick={() => handleAdjust(-1)}
          disabled={value <= min}
          aria-label="Diminuir ciclos"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#171717] text-white transition hover:bg-white/10 disabled:opacity-40 cursor-pointer"
        >
          <Minus className="h-4 w-4" />
        </button>

        <div className="flex flex-1 items-center justify-center gap-2 px-2">
          <RefreshCw className="h-4 w-4 text-[#FFC62E]" />
          <span className="font-display text-xl tracking-wider text-white">
            {value}x
          </span>
        </div>

        <button
          type="button"
          onClick={() => handleAdjust(1)}
          disabled={value >= max}
          aria-label="Aumentar ciclos"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#171717] text-white transition hover:bg-white/10 disabled:opacity-40 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

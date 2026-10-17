"use client";

import { Minus, Plus } from "lucide-react";
import { formatSeconds } from "@/lib/utils";

interface DurationInputProps {
  label?: string;
  value: number; // in seconds
  step?: number;
  min?: number;
  max?: number;
  onChange: (nextSeconds: number) => void;
}

export function DurationInput({
  label,
  value,
  step = 5,
  min = 0,
  max = 3600,
  onChange,
}: DurationInputProps) {
  const handleAdjust = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta));
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="font-condensed text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
          {label}
        </span>
      )}
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#232323] p-1.5">
        <button
          type="button"
          onClick={() => handleAdjust(-step)}
          disabled={value <= min}
          aria-label={`Diminuir ${step} segundos`}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#171717] text-white transition hover:bg-white/10 disabled:opacity-40 cursor-pointer"
        >
          <Minus className="h-4 w-4" />
        </button>

        <div className="flex flex-1 flex-col items-center justify-center px-2">
          <span className="font-display text-xl tracking-wider text-white">
            {formatSeconds(value)}
          </span>
          <span className="font-condensed text-[10px] uppercase tracking-widest text-[#9CA3AF]">
            {value}s
          </span>
        </div>

        <button
          type="button"
          onClick={() => handleAdjust(step)}
          disabled={value >= max}
          aria-label={`Aumentar ${step} segundos`}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#171717] text-white transition hover:bg-white/10 disabled:opacity-40 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

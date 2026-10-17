"use client";

import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DurationInput } from "@/components/workout/DurationInput";
import { INTERVAL_TYPE_META } from "@/constants/theme";
import { cn } from "@/lib/utils";
import type { IntervalType, WorkoutInterval } from "@/types/workout";

interface IntervalEditorProps {
  interval: WorkoutInterval;
  canRemove: boolean;
  onChange: (updated: WorkoutInterval) => void;
  onRemove: () => void;
}

const INTERVAL_OPTIONS: IntervalType[] = ["work", "rest", "prepare", "cooldown"];

export function IntervalEditor({
  interval,
  canRemove,
  onChange,
  onRemove,
}: IntervalEditorProps) {
  const meta = INTERVAL_TYPE_META[interval.type];

  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#171717] p-3.5 md:flex-row md:items-center"
      style={{
        borderLeftWidth: "4px",
        borderLeftColor: meta.bgHex,
      }}
    >
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {INTERVAL_OPTIONS.map((typeOption) => {
            const optionMeta = INTERVAL_TYPE_META[typeOption];
            const isSelected = interval.type === typeOption;
            return (
              <button
                key={typeOption}
                type="button"
                onClick={() => onChange({ ...interval, type: typeOption })}
                className={cn(
                  "rounded-lg px-2.5 py-1 font-condensed text-xs font-bold uppercase tracking-wider transition cursor-pointer",
                  isSelected
                    ? optionMeta.badgeClass
                    : "bg-[#232323] text-[#9CA3AF] hover:text-white"
                )}
              >
                {optionMeta.label}
              </button>
            );
          })}
        </div>

        <Input
          value={interval.name}
          onChange={(e) => onChange({ ...interval, name: e.target.value })}
          placeholder="Nome do exercício / intervalo"
          className="h-10 text-sm"
        />
      </div>

      <div className="flex items-center justify-between gap-3 md:justify-end">
        <div className="w-40">
          <DurationInput
            value={interval.duration}
            min={5}
            step={5}
            onChange={(duration) => onChange({ ...interval, duration })}
          />
        </div>

        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label="Remover intervalo"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#232323] text-[#9CA3AF] transition hover:bg-[#FF3B30]/20 hover:text-[#FF3B30] disabled:opacity-30 cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

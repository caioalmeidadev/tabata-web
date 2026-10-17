"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IntervalEditor } from "@/components/workout/IntervalEditor";
import { RepeatsInput } from "@/components/workout/RepeatsInput";
import type { IntervalType, WorkoutInterval, WorkoutRound } from "@/types/workout";

interface RoundEditorProps {
  round: WorkoutRound;
  roundIndex: number;
  canRemove: boolean;
  onChange: (updated: WorkoutRound) => void;
  onRemove: () => void;
}

export function RoundEditor({
  round,
  roundIndex,
  canRemove,
  onChange,
  onRemove,
}: RoundEditorProps) {
  const handleIntervalChange = (idx: number, updated: WorkoutInterval) => {
    const nextIntervals = [...round.intervals];
    nextIntervals[idx] = updated;
    onChange({ ...round, intervals: nextIntervals });
  };

  const handleRemoveInterval = (idx: number) => {
    if (round.intervals.length <= 1) return;
    const nextIntervals = round.intervals.filter((_, i) => i !== idx);
    onChange({ ...round, intervals: nextIntervals });
  };

  const handleAddInterval = (type: IntervalType) => {
    const newInterval: WorkoutInterval = {
      id: `int-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: type === "work" ? "Exercício" : "Descanso",
      type,
      duration: type === "work" ? 20 : 10,
    };
    onChange({
      ...round,
      intervals: [...round.intervals, newInterval],
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#232323]/60 p-4 md:p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#83FF36] font-display text-base text-[#0A0A0A]">
            R{roundIndex + 1}
          </span>
          <Input
            value={round.name}
            onChange={(e) => onChange({ ...round, name: e.target.value })}
            placeholder={`Round ${roundIndex + 1}`}
            className="h-10 max-w-xs font-condensed font-bold uppercase tracking-wider"
          />
        </div>

        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <RepeatsInput
            value={round.repeats}
            onChange={(repeats) => onChange({ ...round, repeats })}
          />

          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              aria-label="Remover round"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#171717] text-[#9CA3AF] transition hover:bg-[#FF3B30]/20 hover:text-[#FF3B30] cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {round.intervals.map((interval, idx) => (
          <IntervalEditor
            key={interval.id}
            interval={interval}
            canRemove={round.intervals.length > 1}
            onChange={(updated) => handleIntervalChange(idx, updated)}
            onRemove={() => handleRemoveInterval(idx)}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => handleAddInterval("work")}
        >
          <Plus className="h-4 w-4 text-[#83FF36]" />
          Adicionar Work
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => handleAddInterval("rest")}
        >
          <Plus className="h-4 w-4 text-[#FF3B30]" />
          Adicionar Rest
        </Button>
      </div>
    </div>
  );
}

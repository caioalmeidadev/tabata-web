"use client";

import Link from "next/link";
import { Clock, Copy, Pencil, Play, RefreshCw, Repeat, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getTotalWorkoutDurationSeconds } from "@/engine/workout-runner";
import { formatSeconds } from "@/lib/utils";
import type { Workout } from "@/types/workout";

interface WorkoutCardProps {
  workout: Workout;
  onDelete?: (id: string) => void;
}

export function WorkoutCard({ workout, onDelete }: WorkoutCardProps) {
  const totalDurationSec = getTotalWorkoutDurationSeconds(workout);
  const firstRound = workout.rounds[0];
  const workInterval = firstRound?.intervals.find((i) => i.type === "work");
  const restInterval = firstRound?.intervals.find((i) => i.type === "rest");
  const totalRepeats = workout.rounds.reduce((acc, r) => acc + r.repeats, 0);

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden transition-all hover:border-white/25 hover:bg-[#1d1d1d]">
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: workout.color || "#83FF36" }}
      />

      <div className="flex flex-1 flex-col justify-between gap-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            {workout.isPreset && (
              <span className="mb-1 inline-block rounded-md bg-white/10 px-2 py-0.5 font-condensed text-[10px] font-bold uppercase tracking-widest text-[#83FF36]">
                PRESET OFICIAL
              </span>
            )}
            <h3 className="font-display text-2xl uppercase tracking-wide text-white">
              {workout.name}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl bg-[#232323] px-3 py-1.5">
            <Clock className="h-4 w-4 text-[#83FF36]" />
            <span className="font-display text-lg text-white">
              {formatSeconds(totalDurationSec)}
            </span>
          </div>
        </div>

        {/* Resumo de tempos */}
        <div className="grid grid-cols-4 gap-2 rounded-xl bg-[#0A0A0A]/70 p-3 text-center">
          <div className="flex flex-col">
            <span className="font-condensed text-[10px] font-bold uppercase tracking-wider text-[#FFFF2E]">
              PREPARE
            </span>
            <span className="font-display text-base text-white">
              {workout.prepareDuration}s
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-condensed text-[10px] font-bold uppercase tracking-wider text-[#83FF36]">
              WORK
            </span>
            <span className="font-display text-base text-white">
              {workInterval ? `${workInterval.duration}s` : "-"}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-condensed text-[10px] font-bold uppercase tracking-wider text-[#FF3B30]">
              REST
            </span>
            <span className="font-display text-base text-white">
              {restInterval ? `${restInterval.duration}s` : "-"}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-condensed text-[10px] font-bold uppercase tracking-wider text-[#249CFF]">
              REPEATS
            </span>
            <span className="font-display text-base text-white">
              {totalRepeats}x
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
            <span className="inline-flex items-center gap-1 font-condensed uppercase tracking-wider">
              <Repeat className="h-3.5 w-3.5 text-[#249CFF]" />
              {workout.rounds.length} Round{workout.rounds.length > 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1 font-condensed uppercase tracking-wider">
              <RefreshCw className="h-3.5 w-3.5 text-[#FFC62E]" />
              {workout.cycles} Cycle{workout.cycles > 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!workout.isPreset && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(workout.id)}
                aria-label={`Excluir treino ${workout.name}`}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#232323] text-[#9CA3AF] transition hover:bg-[#FF3B30]/20 hover:text-[#FF3B30] cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            <Link
              href={`/workout/${workout.id}`}
              aria-label={
                workout.isPreset
                  ? `Personalizar preset ${workout.name}`
                  : `Editar treino ${workout.name}`
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#232323] text-white transition hover:bg-white/15"
            >
              {workout.isPreset ? (
                <Copy className="h-4 w-4" />
              ) : (
                <Pencil className="h-4 w-4" />
              )}
            </Link>

            <Link href={`/workout/${workout.id}/play`}>
              <Button size="sm" className="h-10 px-4">
                <Play className="h-4 w-4 fill-current" />
                Iniciar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

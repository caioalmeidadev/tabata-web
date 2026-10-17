"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Plus, Save } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomActions } from "@/components/layout/BottomActions";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CyclesInput } from "@/components/workout/CyclesInput";
import { DurationInput } from "@/components/workout/DurationInput";
import { RoundEditor } from "@/components/workout/RoundEditor";
import { WORKOUT_ACCENT_COLORS } from "@/constants/theme";
import { getTotalWorkoutDurationSeconds } from "@/engine/workout-runner";
import { cn, formatSeconds } from "@/lib/utils";
import { useWorkoutStore } from "@/stores/workout.store";
import type { Workout, WorkoutRound } from "@/types/workout";

interface WorkoutEditorProps {
  initialWorkout?: Workout;
  mode: "create" | "edit";
}

function createDefaultRound(index: number, suffix = "init"): WorkoutRound {
  return {
    id: `round-${suffix}-${index}`,
    name: `Round ${index + 1}`,
    repeats: 8,
    intervals: [
      {
        id: `int-work-${suffix}-${index}`,
        name: "Esforço (Work)",
        type: "work",
        duration: 20,
      },
      {
        id: `int-rest-${suffix}-${index}`,
        name: "Descanso (Rest)",
        type: "rest",
        duration: 10,
      },
    ],
  };
}

export function WorkoutEditor({ initialWorkout, mode }: WorkoutEditorProps) {
  const router = useRouter();
  const addWorkout = useWorkoutStore((s) => s.addWorkout);
  const updateWorkout = useWorkoutStore((s) => s.updateWorkout);

  const [name, setName] = useState(initialWorkout?.name ?? "Meu Treino Tabata");
  const [color, setColor] = useState<string>(
    initialWorkout?.color ?? WORKOUT_ACCENT_COLORS[0].value
  );
  const [prepareDuration, setPrepareDuration] = useState<number>(
    initialWorkout?.prepareDuration ?? 10
  );
  const [cycles, setCycles] = useState<number>(initialWorkout?.cycles ?? 1);
  const [restBetweenCycles, setRestBetweenCycles] = useState<number>(
    initialWorkout?.restBetweenCycles ?? 30
  );
  const [rounds, setRounds] = useState<WorkoutRound[]>(
    initialWorkout?.rounds?.length
      ? initialWorkout.rounds
      : [createDefaultRound(0)]
  );

  const previewWorkout: Workout = {
    id: initialWorkout?.id ?? "preview",
    name: name.trim() || "Sem Nome",
    color,
    prepareDuration,
    rounds,
    cycles,
    restBetweenCycles: cycles > 1 ? restBetweenCycles : 0,
    createdAt: initialWorkout?.createdAt ?? "",
    updatedAt: "",
  };

  const totalDurationSec = getTotalWorkoutDurationSeconds(previewWorkout);

  const handleRoundChange = (idx: number, updated: WorkoutRound) => {
    const next = [...rounds];
    next[idx] = updated;
    setRounds(next);
  };

  const handleRemoveRound = (idx: number) => {
    if (rounds.length <= 1) return;
    setRounds(rounds.filter((_, i) => i !== idx));
  };

  const handleAddRound = () => {
    setRounds([
      ...rounds,
      createDefaultRound(rounds.length, String(Date.now())),
    ]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: name.trim() || "Treino Personalizado",
      color,
      prepareDuration,
      rounds,
      cycles,
      restBetweenCycles: cycles > 1 ? restBetweenCycles : 0,
    };

    if (mode === "edit" && initialWorkout && !initialWorkout.isPreset) {
      updateWorkout(initialWorkout.id, payload);
    } else {
      addWorkout(payload);
    }

    router.push("/");
  };

  return (
    <form onSubmit={handleSave} className="flex min-h-screen flex-col">
      <AppHeader
        rightSlot={
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#171717] px-3.5 py-2">
            <Clock className="h-4 w-4 text-[#83FF36]" />
            <span className="font-condensed text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
              Total:
            </span>
            <span className="font-display text-lg text-white">
              {formatSeconds(totalDurationSec)}
            </span>
          </div>
        }
      />

      <PageContainer className="gap-6 pb-24">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => router.push("/")}
              aria-label="Voltar"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-3xl uppercase tracking-wide md:text-4xl">
                {mode === "create" || initialWorkout?.isPreset
                  ? "Novo Treino"
                  : "Editar Treino"}
              </h1>
              <p className="text-sm text-[#9CA3AF]">
                Configure preparação, rounds, intervalos e ciclos.
              </p>
            </div>
          </div>
        </div>

        {/* Informações Básicas & Tempos Globais */}
        <Card>
          <CardHeader>
            <CardTitle>Configuração Geral</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="workout-name"
                className="font-condensed text-xs font-bold uppercase tracking-wider text-[#9CA3AF]"
              >
                Nome do Treino
              </label>
              <Input
                id="workout-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Tabata Abdômen & Cardio"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-condensed text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                Cor de Destaque
              </span>
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {WORKOUT_ACCENT_COLORS.map((c) => {
                  const active = color === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      aria-label={`Cor ${c.name}`}
                      className={cn(
                        "h-9 w-9 rounded-full border-2 transition-transform cursor-pointer",
                        active
                          ? "scale-110 border-white ring-2 ring-white/40"
                          : "border-transparent opacity-70 hover:opacity-100"
                      )}
                      style={{ backgroundColor: c.value }}
                    />
                  );
                })}
              </div>
            </div>

            <DurationInput
              label="Preparação Inicial (Prepare)"
              value={prepareDuration}
              step={5}
              min={0}
              onChange={setPrepareDuration}
            />

            <CyclesInput value={cycles} onChange={setCycles} />

            {cycles > 1 && (
              <div className="md:col-span-2">
                <DurationInput
                  label="Descanso entre Ciclos (Rest Between Cycles)"
                  value={restBetweenCycles}
                  step={5}
                  min={0}
                  onChange={setRestBetweenCycles}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Rounds */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl uppercase tracking-wide">
              Rounds & Intervalos
            </h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddRound}
            >
              <Plus className="h-4 w-4 text-[#83FF36]" />
              Adicionar Round
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            {rounds.map((round, idx) => (
              <RoundEditor
                key={round.id}
                round={round}
                roundIndex={idx}
                canRemove={rounds.length > 1}
                onChange={(updated) => handleRoundChange(idx, updated)}
                onRemove={() => handleRemoveRound(idx)}
              />
            ))}
          </div>
        </div>
      </PageContainer>

      <BottomActions>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/")}
        >
          Cancelar
        </Button>
        <Button type="submit">
          <Save className="h-5 w-5" />
          Salvar Treino
        </Button>
      </BottomActions>
    </form>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Flame,
  Maximize2,
  Plus,
  Sparkles,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { InstallPwaBanner } from "@/components/pwa/InstallPwaBanner";
import { Button } from "@/components/ui/button";
import { WorkoutCard } from "@/components/workout/WorkoutCard";
import { PRESET_WORKOUTS } from "@/constants/presets";
import { getTotalWorkoutDurationSeconds } from "@/engine/workout-runner";
import { cn, formatSeconds } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings.store";
import { useWorkoutStore } from "@/stores/workout.store";

export default function DashboardPage() {
  const hydrateWorkouts = useWorkoutStore((s) => s.hydrate);
  const customWorkouts = useWorkoutStore((s) => s.customWorkouts);
  const lastWorkoutId = useWorkoutStore((s) => s.lastWorkoutId);
  const getWorkoutById = useWorkoutStore((s) => s.getWorkoutById);
  const deleteWorkout = useWorkoutStore((s) => s.deleteWorkout);

  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const audioEnabled = useSettingsStore((s) => s.audioEnabled);
  const toggleAudio = useSettingsStore((s) => s.toggleAudio);
  const autoFullscreen = useSettingsStore((s) => s.autoFullscreen);
  const toggleAutoFullscreen = useSettingsStore((s) => s.toggleAutoFullscreen);

  useEffect(() => {
    hydrateWorkouts();
    hydrateSettings();
  }, [hydrateWorkouts, hydrateSettings]);

  const quickStartWorkout =
    (lastWorkoutId ? getWorkoutById(lastWorkoutId) : undefined) ??
    PRESET_WORKOUTS[0];

  const quickStartDuration = getTotalWorkoutDurationSeconds(quickStartWorkout);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        rightSlot={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleAutoFullscreen}
              title={
                autoFullscreen
                  ? "Tela cheia automática ativada"
                  : "Ativar tela cheia automática ao iniciar treino"
              }
              aria-label={
                autoFullscreen
                  ? "Desativar tela cheia automática"
                  : "Ativar tela cheia automática"
              }
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border transition cursor-pointer",
                autoFullscreen
                  ? "border-[#83FF36]/40 bg-[#83FF36]/15 text-[#83FF36]"
                  : "border-white/10 bg-[#171717] text-[#9CA3AF] hover:bg-[#232323] hover:text-white"
              )}
            >
              <Maximize2 className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={toggleAudio}
              aria-label={
                audioEnabled
                  ? "Desativar alertas sonoros"
                  : "Ativar alertas sonoros"
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#171717] text-white transition hover:bg-[#232323] cursor-pointer"
            >
              {audioEnabled ? (
                <Volume2 className="h-5 w-5 text-[#83FF36]" />
              ) : (
                <VolumeX className="h-5 w-5 text-[#9CA3AF]" />
              )}
            </button>

            <Link href="/workout/new">
              <Button size="sm" className="h-10">
                <Plus className="h-4 w-4 stroke-[2.5]" />
                Criar Treino
              </Button>
            </Link>
          </div>
        }
      />

      <PageContainer className="gap-8">
        <InstallPwaBanner />

        {/* Hero / Quick Start */}
        <section className="relative overflow-hidden rounded-3xl border border-[#83FF36]/30 bg-gradient-to-br from-[#171717] via-[#171717] to-[#83FF36]/15 p-6 md:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex flex-col gap-2">
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#83FF36]/15 px-3 py-1 font-condensed text-xs font-bold uppercase tracking-widest text-[#83FF36]">
                <Zap className="h-3.5 w-3.5 fill-current" />
                INÍCIO RÁPIDO
              </div>
              <h1 className="font-display text-4xl uppercase tracking-wide text-white md:text-5xl">
                {quickStartWorkout.name}
              </h1>
              <p className="max-w-xl text-sm text-[#9CA3AF] md:text-base">
                Pronto para treinar? Inicie imediatamente seu último treino ou
                o protocolo Tabata clássico com cronômetro de alta precisão.
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-4 font-condensed text-sm font-bold uppercase tracking-wider text-white/90">
                <span>Duração: {formatSeconds(quickStartDuration)}</span>
                <span>•</span>
                <span>Prepare: {quickStartWorkout.prepareDuration}s</span>
                <span>•</span>
                <span>Ciclos: {quickStartWorkout.cycles}x</span>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link href={`/workout/${quickStartWorkout.id}/play`}>
                <Button size="lg" className="w-full sm:w-auto">
                  <Flame className="h-5 w-5 fill-current" />
                  Iniciar Agora
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Meus Treinos Salvos */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl uppercase tracking-wide md:text-3xl">
                Meus Treinos
              </h2>
              <p className="text-xs text-[#9CA3AF] md:text-sm">
                Treinos personalizados salvos neste dispositivo
              </p>
            </div>

            <Link href="/workout/new">
              <Button variant="secondary" size="sm">
                <Plus className="h-4 w-4 text-[#83FF36]" />
                Novo Treino
              </Button>
            </Link>
          </div>

          {customWorkouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-[#171717]/50 p-8 text-center">
              <Sparkles className="h-8 w-8 text-[#83FF36]" />
              <div className="max-w-md">
                <h3 className="font-display text-xl uppercase tracking-wide text-white">
                  Nenhum treino personalizado ainda
                </h3>
                <p className="mt-1 text-sm text-[#9CA3AF]">
                  Crie seu próprio treino configurando tempos de preparação,
                  esforço, descanso, repetições e múltiplos ciclos.
                </p>
              </div>
              <Link href="/workout/new" className="mt-1">
                <Button>
                  <Plus className="h-4 w-4" />
                  Criar Meu Primeiro Treino
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {customWorkouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  onDelete={deleteWorkout}
                />
              ))}
            </div>
          )}
        </section>

        {/* Presets */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="font-display text-2xl uppercase tracking-wide md:text-3xl">
              Presets Prontos
            </h2>
            <p className="text-xs text-[#9CA3AF] md:text-sm">
              Protocolos clássicos prontos para iniciar com 1 clique
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {PRESET_WORKOUTS.map((preset) => (
              <WorkoutCard key={preset.id} workout={preset} />
            ))}
          </div>
        </section>
      </PageContainer>
    </div>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Home, Play, RotateCcw } from "lucide-react";
import { SoundSettingsModal } from "@/components/settings/SoundSettingsModal";
import { TimerControls } from "@/components/timer/TimerControls";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TimerHeader } from "@/components/timer/TimerHeader";
import { TimerNext } from "@/components/timer/TimerNext";
import { TimerProgress } from "@/components/timer/TimerProgress";
import { TimerStats } from "@/components/timer/TimerStats";
import { Button } from "@/components/ui/button";
import { INTERVAL_TYPE_META } from "@/constants/theme";
import {
  getCurrentStep,
  getNextStep,
  getRemainingWorkoutMs,
  getTotalWorkoutDurationSeconds,
} from "@/engine/workout-runner";
import { formatSeconds } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings.store";
import { useTimerStore } from "@/stores/timer.store";
import { useWorkoutStore } from "@/stores/workout.store";

function PlayWorkoutContent() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const router = useRouter();

  const hydrateWorkouts = useWorkoutStore((s) => s.hydrate);
  const workoutsHydrated = useWorkoutStore((s) => s.hydrated);
  const getWorkoutById = useWorkoutStore((s) => s.getWorkoutById);
  const setLastWorkoutId = useWorkoutStore((s) => s.setLastWorkoutId);

  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const settingsHydrated = useSettingsStore((s) => s.hydrated);
  const audioEnabled = useSettingsStore((s) => s.audioEnabled);
  const toggleAudio = useSettingsStore((s) => s.toggleAudio);
  const autoFullscreen = useSettingsStore((s) => s.autoFullscreen);

  const timer = useTimerStore((s) => s.timer);
  const start = useTimerStore((s) => s.start);
  const pause = useTimerStore((s) => s.pause);
  const resume = useTimerStore((s) => s.resume);
  const next = useTimerStore((s) => s.next);
  const previous = useTimerStore((s) => s.previous);
  const stop = useTimerStore((s) => s.stop);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);

  useEffect(() => {
    hydrateWorkouts();
    hydrateSettings();
  }, [hydrateWorkouts, hydrateSettings]);

  const workout = getWorkoutById(id);

  useEffect(() => {
    if (!workoutsHydrated || !workout) return;

    setLastWorkoutId(workout.id);
    start(workout);

    return () => {
      stop();
    };
  }, [workoutsHydrated, workout, start, stop, setLastWorkoutId]);

  // Auto-enter fullscreen if enabled in settings and sync fullscreenchange
  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFsChange);

    if (settingsHydrated && autoFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        // Browsers may block fullscreen if not triggered directly by user gesture
      });
    }

    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
    };
  }, [settingsHydrated, autoFullscreen]);

  // Keep screen awake during workout and re-acquire on visibilitychange
  useEffect(() => {
    let wakeLock: { release: () => Promise<void> } | null = null;

    async function requestWakeLock() {
      if (
        typeof navigator !== "undefined" &&
        "wakeLock" in navigator &&
        timer.status === "running" &&
        document.visibilityState === "visible"
      ) {
        try {
          wakeLock = await (
            navigator as unknown as {
              wakeLock: {
                request: (
                  type: "screen"
                ) => Promise<{ release: () => Promise<void> }>;
              };
            }
          ).wakeLock.request("screen");
        } catch {
          // Ignore wakeLock permission errors
        }
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && timer.status === "running") {
        requestWakeLock();
      }
    };

    requestWakeLock();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      wakeLock?.release().catch(() => {});
    };
  }, [timer.status]);

  const handleToggleFullscreen = async () => {
    if (typeof document === "undefined") return;
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Ignore fullscreen errors
    }
  };

  const handleExit = () => {
    if (typeof document !== "undefined" && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    stop();
    router.push("/");
  };

  if (!workoutsHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-white">
        <span className="font-display text-3xl uppercase tracking-wider text-[#83FF36]">
          Carregando treino...
        </span>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0A0A0A] px-4 text-center text-white">
        <h1 className="font-display text-4xl uppercase">
          Treino não encontrado
        </h1>
        <Button onClick={() => router.push("/")}>Voltar ao Dashboard</Button>
      </div>
    );
  }

  // FINISHED STATE
  if (timer.status === "finished") {
    const totalDurationSec = getTotalWorkoutDurationSeconds(workout);

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] px-4 py-10 text-center text-white">
        <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-3xl border border-[#83FF36]/30 bg-[#171717] p-8 shadow-2xl">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#83FF36]/15 text-[#83FF36]">
            <CheckCircle2 className="h-12 w-12" />
          </div>

          <span className="font-condensed text-sm font-bold uppercase tracking-[0.2em] text-[#83FF36]">
            TREINO FINALIZADO
          </span>
          <h1 className="mt-1 font-display text-5xl uppercase tracking-wide">
            {workout.name}
          </h1>

          <div className="my-6 w-full rounded-2xl bg-[#232323] p-4">
            <span className="font-condensed text-xs uppercase tracking-widest text-[#9CA3AF]">
              DURAÇÃO TOTAL
            </span>
            <p className="font-display text-4xl text-white">
              {formatSeconds(totalDurationSec)}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={handleExit}
            >
              <Home className="h-5 w-5" />
              Voltar
            </Button>
            <Button
              variant="default"
              size="lg"
              className="flex-1"
              onClick={() => start(workout)}
            >
              <RotateCcw className="h-5 w-5" />
              Repetir Treino
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = getCurrentStep(timer.steps, timer.currentStepIndex);
  const nextStep = getNextStep(timer.steps, timer.currentStepIndex);

  if (!currentStep) {
    return null;
  }

  const meta = INTERVAL_TYPE_META[currentStep.type];
  const totalRemainingMs = getRemainingWorkoutMs(
    timer.steps,
    timer.currentStepIndex,
    timer.remainingMs
  );

  return (
    <div
      className="relative flex min-h-screen w-full flex-col justify-between transition-colors duration-300"
      style={{
        backgroundColor: meta.bgHex,
        color: meta.textColor,
      }}
    >
      <TimerHeader
        workoutName={workout.name}
        totalRemainingMs={totalRemainingMs}
        audioEnabled={audioEnabled}
        isFullscreen={isFullscreen}
        onToggleAudio={toggleAudio}
        onOpenSoundSettings={() => {
          pause();
          setIsSoundModalOpen(true);
        }}
        onToggleFullscreen={handleToggleFullscreen}
        onExit={handleExit}
      />

      <TimerDisplay
        intervalType={currentStep.type}
        intervalName={currentStep.name}
        remainingMs={timer.remainingMs}
      />

      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 pb-6 md:pb-10">
        <TimerProgress
          stepRemainingMs={timer.remainingMs}
          stepDurationSec={currentStep.duration}
          currentStepIndex={timer.currentStepIndex}
          totalSteps={timer.steps.length}
        />

        <TimerNext nextStep={nextStep} />

        <TimerStats
          currentRepeat={currentStep.repeat}
          totalRepeats={currentStep.totalRepeats}
          currentCycle={currentStep.cycle}
          totalCycles={currentStep.totalCycles}
        />

        <TimerControls
          status={timer.status}
          canPrevious={timer.currentStepIndex > 0}
          onPrevious={previous}
          onPause={pause}
          onResume={resume}
          onNext={next}
          onStop={handleExit}
        />
      </div>

      {/* PAUSED OVERLAY */}
      {timer.status === "paused" && !isSoundModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0A0A]/85 px-4 backdrop-blur-md">
          <span className="font-condensed text-sm font-bold uppercase tracking-[0.25em] text-[#FFFF2E]">
            CRONÔMETRO EM ESPERA
          </span>
          <h2 className="mt-2 font-display text-7xl uppercase tracking-wider text-white md:text-8xl">
            PAUSED
          </h2>
          <p className="mt-2 font-condensed text-lg uppercase tracking-wider text-[#9CA3AF]">
            {currentStep.name} • Restam {formatSeconds(timer.remainingMs / 1000)}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={resume} className="min-w-48">
              <Play className="h-5 w-5 fill-current" />
              Continuar
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleExit}
              className="min-w-48"
            >
              Encerrar Treino
            </Button>
          </div>
        </div>
      )}

      <SoundSettingsModal
        open={isSoundModalOpen}
        onClose={() => setIsSoundModalOpen(false)}
      />
    </div>
  );
}

export default function PlayWorkoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-white">
          <span className="font-display text-3xl uppercase tracking-wider text-[#83FF36]">
            Carregando treino...
          </span>
        </div>
      }
    >
      <PlayWorkoutContent />
    </Suspense>
  );
}

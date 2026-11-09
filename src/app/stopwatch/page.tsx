"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Flag,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Timer as TimerIcon,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import { SoundSettingsModal } from "@/components/settings/SoundSettingsModal";
import { Button } from "@/components/ui/button";
import { cn, formatStopwatchMs } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings.store";
import { useStopwatchStore } from "@/stores/stopwatch.store";

export default function StopwatchPage() {
  const router = useRouter();

  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const audioEnabled = useSettingsStore((s) => s.audioEnabled);
  const toggleAudio = useSettingsStore((s) => s.toggleAudio);

  const status = useStopwatchStore((s) => s.status);
  const elapsedMs = useStopwatchStore((s) => s.elapsedMs);
  const laps = useStopwatchStore((s) => s.laps);
  const start = useStopwatchStore((s) => s.start);
  const pause = useStopwatchStore((s) => s.pause);
  const resume = useStopwatchStore((s) => s.resume);
  const recordLap = useStopwatchStore((s) => s.recordLap);
  const reset = useStopwatchStore((s) => s.reset);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);

  useEffect(() => {
    hydrateSettings();
    return () => {
      reset();
    };
  }, [hydrateSettings, reset]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
    };
  }, []);

  // Keep screen awake while running
  useEffect(() => {
    let wakeLock: { release: () => Promise<void> } | null = null;

    async function requestWakeLock() {
      if (
        typeof navigator !== "undefined" &&
        "wakeLock" in navigator &&
        status === "running" &&
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
          // Ignore wakeLock errors
        }
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && status === "running") {
        requestWakeLock();
      }
    };

    requestWakeLock();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      wakeLock?.release().catch(() => {});
    };
  }, [status]);

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
    reset();
    router.push("/");
  };

  const formattedTotal = formatStopwatchMs(elapsedMs);
  const lastLapTotalMs = laps.length > 0 ? laps[0].totalElapsedMs : 0;
  const currentLapElapsedMs = Math.max(0, elapsedMs - lastLapTotalMs);
  const formattedCurrentLap = formatStopwatchMs(currentLapElapsedMs);
  const currentLapNumber = laps.length + 1;

  // Identify fastest and slowest laps when 2 or more laps exist
  let fastestLapNumber: number | null = null;
  let slowestLapNumber: number | null = null;

  if (laps.length >= 2) {
    let minDuration = Infinity;
    let maxDuration = -Infinity;

    for (const lap of laps) {
      if (lap.lapDurationMs < minDuration) {
        minDuration = lap.lapDurationMs;
        fastestLapNumber = lap.number;
      }
      if (lap.lapDurationMs > maxDuration) {
        maxDuration = lap.lapDurationMs;
        slowestLapNumber = lap.number;
      }
    }

    if (fastestLapNumber === slowestLapNumber) {
      slowestLapNumber = null;
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col justify-between bg-[#0A0A0A] text-white">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 md:px-8 md:py-6">
        <button
          type="button"
          onClick={handleExit}
          aria-label="Voltar ao início"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#171717] px-3.5 py-2.5 font-condensed text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#232323] cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="hidden sm:inline">Voltar</span>
        </button>

        <div className="flex flex-col items-center text-center">
          <span className="font-condensed text-xs font-bold uppercase tracking-[0.2em] text-[#249CFF]">
            CRONÔMETRO COM VOLTAS
          </span>
          <span className="font-display text-xl uppercase tracking-wider text-white md:text-2xl">
            STOPWATCH PRO
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSoundModalOpen(true)}
            aria-label="Personalizar sons"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#171717] text-white transition hover:bg-[#232323] cursor-pointer"
          >
            <SlidersHorizontal className="h-5 w-5 text-[#83FF36]" />
          </button>

          <button
            type="button"
            onClick={toggleAudio}
            aria-label={audioEnabled ? "Desativar som" : "Ativar som"}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#171717] text-white transition hover:bg-[#232323] cursor-pointer"
          >
            {audioEnabled ? (
              <Volume2 className="h-5 w-5 text-[#83FF36]" />
            ) : (
              <VolumeX className="h-5 w-5 text-[#9CA3AF]" />
            )}
          </button>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            aria-label={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#171717] text-white transition hover:bg-[#232323] cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-between gap-6 px-4 pb-8 pt-2 md:px-8">
        {/* Display Principal */}
        <div className="flex w-full flex-col items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-b from-[#171717] to-[#121212] px-4 py-8 text-center shadow-2xl select-none md:py-10">
          <div
            className={cn(
              "mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1 font-condensed text-xs font-bold uppercase tracking-[0.2em]",
              status === "running"
                ? "bg-[#83FF36]/15 text-[#83FF36]"
                : status === "paused"
                  ? "bg-[#FFFF2E]/15 text-[#FFFF2E]"
                  : "bg-white/10 text-[#9CA3AF]"
            )}
          >
            <TimerIcon className="h-3.5 w-3.5" />
            {status === "running"
              ? "CONTAGEM EM ANDAMENTO"
              : status === "paused"
                ? "CRONÔMETRO PAUSADO"
                : "PRONTO PARA INICIAR"}
          </div>

          {/* Números Gigantes com Centésimos */}
          <div
            className="flex items-baseline justify-center font-display tabular-nums leading-none tracking-tight"
            aria-live="off"
          >
            <span className="text-[5.5rem] text-white sm:text-[7.5rem] md:text-[9.5rem]">
              {formattedTotal.main}
            </span>
            <span className="ml-1 text-[2.75rem] text-[#249CFF] sm:text-[3.75rem] md:text-[4.5rem]">
              .{formattedTotal.centiseconds}
            </span>
          </div>

          {/* Tempo da Volta Atual */}
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#232323]/80 px-5 py-2">
            <span className="font-condensed text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">
              Volta Atual #{currentLapNumber}
            </span>
            <span className="font-display text-2xl tabular-nums tracking-wider text-[#FFFF2E]">
              {formattedCurrentLap.full}
            </span>
          </div>
        </div>

        {/* Botões de Controle */}
        <div className="grid w-full grid-cols-2 gap-3 sm:gap-4">
          {status === "idle" && (
            <Button
              size="lg"
              onClick={start}
              aria-label="Iniciar cronômetro"
              className="col-span-2 h-16 text-xl"
            >
              <Play className="h-6 w-6 fill-current" />
              Iniciar Cronômetro
            </Button>
          )}

          {status === "running" && (
            <>
              <Button
                type="button"
                size="lg"
                onClick={recordLap}
                aria-label="Registrar volta sem parar o cronômetro"
                className="h-16 bg-[#249CFF] text-[#0A0A0A] hover:bg-[#4cb0ff] text-xl shadow-lg shadow-[#249CFF]/20"
              >
                <Flag className="h-6 w-6 fill-current" />
                Volta #{currentLapNumber}
              </Button>

              <Button
                type="button"
                variant="prepare"
                size="lg"
                onClick={pause}
                aria-label="Pausar cronômetro"
                className="h-16 text-xl"
              >
                <Pause className="h-6 w-6 fill-current" />
                Pausar
              </Button>
            </>
          )}

          {status === "paused" && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={reset}
                aria-label="Zerar cronômetro e voltas"
                className="h-16 text-xl border-[#FF3B30]/40 text-[#FF3B30] hover:bg-[#FF3B30]/15"
              >
                <RotateCcw className="h-6 w-6" />
                Zerar
              </Button>

              <Button
                type="button"
                size="lg"
                onClick={resume}
                aria-label="Continuar cronômetro"
                className="h-16 text-xl"
              >
                <Play className="h-6 w-6 fill-current" />
                Continuar
              </Button>
            </>
          )}
        </div>

        {/* Lista de Voltas Registradas */}
        <section className="flex w-full flex-1 flex-col rounded-3xl border border-white/10 bg-[#171717] p-4 md:p-6">
          <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-[#249CFF]" />
              <h2 className="font-display text-xl uppercase tracking-wider text-white">
                Registro de Voltas
              </h2>
            </div>
            <span className="rounded-full bg-[#232323] px-3 py-1 font-condensed text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
              {laps.length} {laps.length === 1 ? "volta" : "voltas"}
            </span>
          </div>

          {laps.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
              <p className="font-condensed text-sm uppercase tracking-wider text-[#9CA3AF]">
                Nenhuma volta registrada ainda.
              </p>
              <p className="mt-1 text-xs text-white/50">
                Toque em &ldquo;Volta&rdquo; durante a contagem para registrar parciais sem interromper o cronômetro.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto max-h-72 pr-1">
              <div className="grid grid-cols-3 px-3 py-1 font-condensed text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">
                <span>Volta</span>
                <span className="text-center">Tempo da Volta</span>
                <span className="text-right">Tempo Total</span>
              </div>

              {laps.map((lap) => {
                const isFastest = lap.number === fastestLapNumber;
                const isSlowest = lap.number === slowestLapNumber;
                const lapFormatted = formatStopwatchMs(lap.lapDurationMs);
                const totalFormatted = formatStopwatchMs(lap.totalElapsedMs);

                return (
                  <div
                    key={lap.number}
                    className={cn(
                      "grid grid-cols-3 items-center rounded-2xl border px-4 py-3 transition",
                      isFastest
                        ? "border-[#83FF36]/40 bg-[#83FF36]/10"
                        : isSlowest
                          ? "border-[#FF3B30]/40 bg-[#FF3B30]/10"
                          : "border-white/5 bg-[#232323]/70"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg tracking-wider text-white">
                        #{String(lap.number).padStart(2, "0")}
                      </span>
                      {isFastest && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#83FF36] px-2 py-0.5 font-condensed text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A]">
                          <Trophy className="h-3 w-3" />
                          Melhor
                        </span>
                      )}
                      {isSlowest && (
                        <span className="inline-flex items-center rounded-full bg-[#FF3B30] px-2 py-0.5 font-condensed text-[10px] font-bold uppercase tracking-wider text-white">
                          Mais Lenta
                        </span>
                      )}
                    </div>

                    <div
                      className={cn(
                        "text-center font-display text-xl tabular-nums tracking-wider",
                        isFastest
                          ? "text-[#83FF36]"
                          : isSlowest
                            ? "text-[#FF3B30]"
                            : "text-[#249CFF]"
                      )}
                    >
                      +{lapFormatted.full}
                    </div>

                    <div className="text-right font-display text-xl tabular-nums tracking-wider text-white">
                      {totalFormatted.full}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <SoundSettingsModal
        open={isSoundModalOpen}
        onClose={() => setIsSoundModalOpen(false)}
      />
    </div>
  );
}

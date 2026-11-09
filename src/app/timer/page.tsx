"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Hourglass,
  Maximize2,
  Minimize2,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Volume2,
  VolumeX,
} from "lucide-react";
import { SoundSettingsModal } from "@/components/settings/SoundSettingsModal";
import { Button } from "@/components/ui/button";
import { cn, formatMs, formatSeconds } from "@/lib/utils";
import { useCountdownStore } from "@/stores/countdown.store";
import { useSettingsStore } from "@/stores/settings.store";

const QUICK_PRESETS = [
  { label: "30s", seconds: 30 },
  { label: "45s", seconds: 45 },
  { label: "1 min", seconds: 60 },
  { label: "1:30", seconds: 90 },
  { label: "2 min", seconds: 120 },
  { label: "3 min", seconds: 180 },
  { label: "5 min", seconds: 300 },
  { label: "10 min", seconds: 600 },
  { label: "15 min", seconds: 900 },
  { label: "20 min", seconds: 1200 },
  { label: "30 min", seconds: 1800 },
];

export default function CountdownTimerPage() {
  const router = useRouter();

  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const audioEnabled = useSettingsStore((s) => s.audioEnabled);
  const toggleAudio = useSettingsStore((s) => s.toggleAudio);

  const status = useCountdownStore((s) => s.status);
  const durationSeconds = useCountdownStore((s) => s.durationSeconds);
  const totalDurationMs = useCountdownStore((s) => s.totalDurationMs);
  const remainingMs = useCountdownStore((s) => s.remainingMs);
  const setDurationSeconds = useCountdownStore((s) => s.setDurationSeconds);
  const addSeconds = useCountdownStore((s) => s.addSeconds);
  const start = useCountdownStore((s) => s.start);
  const pause = useCountdownStore((s) => s.pause);
  const resume = useCountdownStore((s) => s.resume);
  const reset = useCountdownStore((s) => s.reset);

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

  const minutesPart = Math.floor(durationSeconds / 60);
  const secondsPart = durationSeconds % 60;

  const handleAdjustMinutes = (deltaMin: number) => {
    const nextMin = Math.max(0, Math.min(599, minutesPart + deltaMin));
    const nextTotal = Math.max(5, nextMin * 60 + secondsPart);
    setDurationSeconds(nextTotal);
  };

  const handleAdjustSeconds = (deltaSec: number) => {
    const nextTotal = Math.max(5, Math.min(35999, durationSeconds + deltaSec));
    setDurationSeconds(nextTotal);
  };

  const progressFraction =
    totalDurationMs > 0
      ? Math.min(1, Math.max(0, remainingMs / totalDurationMs))
      : 0;

  const isEndingSoon =
    status === "running" && remainingMs > 0 && remainingMs <= 3500;

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
          <span className="font-condensed text-xs font-bold uppercase tracking-[0.2em] text-[#FFC62E]">
            TEMPORIZADOR DIRETO
          </span>
          <span className="font-display text-xl uppercase tracking-wider text-white md:text-2xl">
            TIMER REGRESSIVO
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
        {status === "finished" ? (
          <div className="my-auto flex w-full max-w-md flex-col items-center rounded-3xl border border-[#83FF36]/40 bg-[#171717] p-8 text-center shadow-2xl">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#83FF36]/15 text-[#83FF36]">
              <CheckCircle2 className="h-12 w-12" />
            </div>

            <span className="font-condensed text-sm font-bold uppercase tracking-[0.2em] text-[#83FF36]">
              CONTAGEM CONCLUÍDA
            </span>
            <h1 className="mt-1 font-display text-5xl uppercase tracking-wide text-white">
              TEMPO ESGOTADO!
            </h1>

            <div className="my-6 w-full rounded-2xl bg-[#232323] p-4">
              <span className="font-condensed text-xs uppercase tracking-widest text-[#9CA3AF]">
                TEMPO CONFIGURADO
              </span>
              <p className="font-display text-4xl text-white">
                {formatSeconds(durationSeconds)}
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={reset}
              >
                Ajustar Tempo
              </Button>
              <Button size="lg" className="flex-1" onClick={start}>
                <RotateCcw className="h-5 w-5" />
                Repetir Timer
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Display Central do Timer */}
            <div
              className={cn(
                "flex w-full flex-col items-center justify-center rounded-3xl border px-4 py-8 text-center shadow-2xl transition-colors select-none md:py-10",
                isEndingSoon
                  ? "border-[#FF3B30]/60 bg-gradient-to-b from-[#FF3B30]/20 to-[#171717]"
                  : status === "running"
                    ? "border-[#83FF36]/30 bg-gradient-to-b from-[#171717] to-[#121212]"
                    : "border-white/10 bg-gradient-to-b from-[#171717] to-[#121212]"
              )}
            >
              <div
                className={cn(
                  "mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1 font-condensed text-xs font-bold uppercase tracking-[0.2em]",
                  isEndingSoon
                    ? "bg-[#FF3B30]/20 text-[#FF3B30]"
                    : status === "running"
                      ? "bg-[#83FF36]/15 text-[#83FF36]"
                      : status === "paused"
                        ? "bg-[#FFFF2E]/15 text-[#FFFF2E]"
                        : "bg-white/10 text-[#9CA3AF]"
                )}
              >
                <Hourglass className="h-3.5 w-3.5" />
                {status === "running"
                  ? "CONTAGEM REGRESSIVA ATIVA"
                  : status === "paused"
                    ? "TIMER EM PAUSA"
                    : "ESCOLHA O TEMPO DO TIMER"}
              </div>

              <div
                className={cn(
                  "font-display text-[6.5rem] tabular-nums leading-[0.95] tracking-tight sm:text-[9rem] md:text-[11rem]",
                  isEndingSoon ? "text-[#FF3B30]" : "text-white"
                )}
                aria-live="polite"
              >
                {formatMs(remainingMs)}
              </div>

              {/* Barra de Progresso quando ativo ou pausado */}
              {status !== "idle" && (
                <div className="mt-6 w-full max-w-md px-4">
                  <div className="h-3 w-full overflow-hidden rounded-full bg-[#232323]">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-100",
                        isEndingSoon ? "bg-[#FF3B30]" : "bg-[#83FF36]"
                      )}
                      style={{ width: `${progressFraction * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Botões rápidos para adicionar tempo (+15s, +30s, +1m) mesmo com timer rodando */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => addSeconds(15)}
                  aria-label="Adicionar 15 segundos"
                  className="rounded-xl border border-white/10 bg-[#232323] px-3.5 py-2 font-condensed text-xs font-bold uppercase tracking-wider text-white transition hover:border-[#83FF36]/50 hover:bg-[#2c2c2c] cursor-pointer"
                >
                  +15 seg
                </button>
                <button
                  type="button"
                  onClick={() => addSeconds(30)}
                  aria-label="Adicionar 30 segundos"
                  className="rounded-xl border border-white/10 bg-[#232323] px-3.5 py-2 font-condensed text-xs font-bold uppercase tracking-wider text-white transition hover:border-[#83FF36]/50 hover:bg-[#2c2c2c] cursor-pointer"
                >
                  +30 seg
                </button>
                <button
                  type="button"
                  onClick={() => addSeconds(60)}
                  aria-label="Adicionar 1 minuto"
                  className="rounded-xl border border-white/10 bg-[#232323] px-3.5 py-2 font-condensed text-xs font-bold uppercase tracking-wider text-white transition hover:border-[#83FF36]/50 hover:bg-[#2c2c2c] cursor-pointer"
                >
                  +1 min
                </button>
                <button
                  type="button"
                  onClick={() => addSeconds(300)}
                  aria-label="Adicionar 5 minutos"
                  className="rounded-xl border border-white/10 bg-[#232323] px-3.5 py-2 font-condensed text-xs font-bold uppercase tracking-wider text-white transition hover:border-[#83FF36]/50 hover:bg-[#2c2c2c] cursor-pointer"
                >
                  +5 min
                </button>
              </div>
            </div>

            {/* Controles de Execução */}
            <div className="grid w-full grid-cols-2 gap-3 sm:gap-4">
              {status === "idle" && (
                <Button
                  type="button"
                  size="lg"
                  onClick={start}
                  aria-label="Iniciar timer regressivo"
                  className="col-span-2 h-16 text-xl"
                >
                  <Play className="h-6 w-6 fill-current" />
                  Iniciar Timer ({formatSeconds(durationSeconds)})
                </Button>
              )}

              {status === "running" && (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={reset}
                    aria-label="Reiniciar timer"
                    className="h-16 text-xl border-[#FF3B30]/40 text-[#FF3B30] hover:bg-[#FF3B30]/15"
                  >
                    <RotateCcw className="h-6 w-6" />
                    Zerar
                  </Button>

                  <Button
                    type="button"
                    variant="prepare"
                    size="lg"
                    onClick={pause}
                    aria-label="Pausar timer"
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
                    aria-label="Zerar timer"
                    className="h-16 text-xl border-[#FF3B30]/40 text-[#FF3B30] hover:bg-[#FF3B30]/15"
                  >
                    <RotateCcw className="h-6 w-6" />
                    Zerar
                  </Button>

                  <Button
                    type="button"
                    size="lg"
                    onClick={resume}
                    aria-label="Continuar timer"
                    className="h-16 text-xl"
                  >
                    <Play className="h-6 w-6 fill-current" />
                    Continuar
                  </Button>
                </>
              )}
            </div>

            {/* Configuração de Minutos/Segundos e Presets Rápidos */}
            <section className="flex w-full flex-col gap-5 rounded-3xl border border-white/10 bg-[#171717] p-4 md:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Ajuste de Minutos */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-condensed text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                    Minutos
                  </span>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#232323] p-2">
                    <button
                      type="button"
                      onClick={() => handleAdjustMinutes(-1)}
                      disabled={minutesPart <= 0}
                      aria-label="Diminuir 1 minuto"
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#171717] text-white transition hover:bg-white/10 disabled:opacity-40 cursor-pointer"
                    >
                      <Minus className="h-5 w-5" />
                    </button>

                    <span className="font-display text-3xl tabular-nums tracking-wider text-white">
                      {String(minutesPart).padStart(2, "0")}{" "}
                      <span className="font-condensed text-xs text-[#9CA3AF]">
                        MIN
                      </span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleAdjustMinutes(1)}
                      aria-label="Aumentar 1 minuto"
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#171717] text-white transition hover:bg-white/10 cursor-pointer"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Ajuste de Segundos */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-condensed text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                    Segundos
                  </span>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#232323] p-2">
                    <button
                      type="button"
                      onClick={() => handleAdjustSeconds(-5)}
                      disabled={durationSeconds <= 5}
                      aria-label="Diminuir 5 segundos"
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#171717] text-white transition hover:bg-white/10 disabled:opacity-40 cursor-pointer"
                    >
                      <Minus className="h-5 w-5" />
                    </button>

                    <span className="font-display text-3xl tabular-nums tracking-wider text-white">
                      {String(secondsPart).padStart(2, "0")}{" "}
                      <span className="font-condensed text-xs text-[#9CA3AF]">
                        SEG
                      </span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleAdjustSeconds(5)}
                      aria-label="Aumentar 5 segundos"
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#171717] text-white transition hover:bg-white/10 cursor-pointer"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Presets Rápidos */}
              <div className="flex flex-col gap-2">
                <span className="font-condensed text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Tempos Rápidos
                </span>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PRESETS.map((preset) => {
                    const active = durationSeconds === preset.seconds;
                    return (
                      <button
                        key={preset.seconds}
                        type="button"
                        onClick={() => setDurationSeconds(preset.seconds)}
                        aria-label={`Definir timer para ${preset.label}`}
                        className={cn(
                          "rounded-xl border px-3.5 py-2 font-condensed text-sm font-bold uppercase tracking-wider transition cursor-pointer",
                          active
                            ? "border-[#FFC62E] bg-[#FFC62E] text-[#0A0A0A]"
                            : "border-white/10 bg-[#232323] text-white hover:border-white/30 hover:bg-[#2c2c2c]"
                        )}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <SoundSettingsModal
        open={isSoundModalOpen}
        onClose={() => setIsSoundModalOpen(false)}
      />
    </div>
  );
}

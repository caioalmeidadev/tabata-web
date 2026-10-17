"use client";

import { ArrowLeft, Maximize2, Minimize2, Volume2, VolumeX } from "lucide-react";
import { formatMs } from "@/lib/utils";

interface TimerHeaderProps {
  workoutName: string;
  totalRemainingMs: number;
  audioEnabled: boolean;
  isFullscreen: boolean;
  onToggleAudio: () => void;
  onToggleFullscreen: () => void;
  onExit: () => void;
}

export function TimerHeader({
  workoutName,
  totalRemainingMs,
  audioEnabled,
  isFullscreen,
  onToggleAudio,
  onToggleFullscreen,
  onExit,
}: TimerHeaderProps) {
  return (
    <header className="flex w-full items-center justify-between px-4 py-4 md:px-8 md:py-6">
      <button
        type="button"
        onClick={onExit}
        aria-label="Sair do treino"
        className="flex items-center gap-2 rounded-xl bg-black/20 px-3.5 py-2.5 font-condensed text-sm font-bold uppercase tracking-wider backdrop-blur-sm transition hover:bg-black/35 cursor-pointer"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="hidden sm:inline">Voltar</span>
      </button>

      <div className="flex flex-col items-center text-center">
        <span className="font-condensed text-xs font-bold uppercase tracking-widest opacity-80">
          {workoutName}
        </span>
        <span className="font-display text-xl tracking-wider md:text-2xl">
          TOTAL {formatMs(totalRemainingMs)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleAudio}
          aria-label={audioEnabled ? "Desativar som" : "Ativar som"}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/20 backdrop-blur-sm transition hover:bg-black/35 cursor-pointer"
        >
          {audioEnabled ? (
            <Volume2 className="h-5 w-5" />
          ) : (
            <VolumeX className="h-5 w-5 opacity-70" />
          )}
        </button>

        <button
          type="button"
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/20 backdrop-blur-sm transition hover:bg-black/35 cursor-pointer"
        >
          {isFullscreen ? (
            <Minimize2 className="h-5 w-5" />
          ) : (
            <Maximize2 className="h-5 w-5" />
          )}
        </button>
      </div>
    </header>
  );
}

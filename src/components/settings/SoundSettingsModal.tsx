"use client";

import {
  Bell,
  Check,
  Play,
  SlidersHorizontal,
  Vibrate,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  audioService,
  END_SOUND_OPTIONS,
  START_SOUND_OPTIONS,
  type EndTimerSoundId,
  type StartTimerSoundId,
} from "@/services/audio.service";
import { useSettingsStore } from "@/stores/settings.store";

interface SoundSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SoundSettingsModal({ open, onClose }: SoundSettingsModalProps) {
  const audioEnabled = useSettingsStore((s) => s.audioEnabled);
  const toggleAudio = useSettingsStore((s) => s.toggleAudio);
  const volume = useSettingsStore((s) => s.volume);
  const setVolume = useSettingsStore((s) => s.setVolume);
  const vibrationEnabled = useSettingsStore((s) => s.vibrationEnabled);
  const setVibrationEnabled = useSettingsStore((s) => s.setVibrationEnabled);
  const startSound = useSettingsStore((s) => s.startSound);
  const setStartSound = useSettingsStore((s) => s.setStartSound);
  const endSound = useSettingsStore((s) => s.endSound);
  const setEndSound = useSettingsStore((s) => s.setEndSound);

  if (!open) return null;

  const handleSelectStartSound = (id: StartTimerSoundId) => {
    setStartSound(id);
    audioService.unlock();
    audioService.playStartSoundById(id, Math.max(0.25, volume));
  };

  const handleSelectEndSound = (id: EndTimerSoundId) => {
    setEndSound(id);
    audioService.unlock();
    audioService.playEndSoundById(id, Math.max(0.25, volume), false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sound-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#171717] text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#83FF36]/15 text-[#83FF36]">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="sound-settings-title"
                className="font-display text-2xl uppercase tracking-wide"
              >
                Sons da Academia & Alertas
              </h2>
              <p className="text-xs text-[#9CA3AF]">
                Personalize o toque de início (Work) e fim (Rest / Conclusão)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar configurações de som"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#232323] text-[#9CA3AF] transition hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
          {/* Volume & Master Toggles */}
          <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#232323]/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={toggleAudio}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-4 py-2.5 font-condensed text-sm font-bold uppercase tracking-wider transition cursor-pointer",
                  audioEnabled
                    ? "bg-[#83FF36] text-[#0A0A0A]"
                    : "bg-[#171717] text-[#9CA3AF] border border-white/10"
                )}
              >
                {audioEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
                {audioEnabled ? "Áudio Ativado" : "Áudio Silenciado"}
              </button>

              <button
                type="button"
                onClick={() => setVibrationEnabled(!vibrationEnabled)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2.5 font-condensed text-sm font-bold uppercase tracking-wider transition cursor-pointer",
                  vibrationEnabled
                    ? "bg-[#249CFF]/20 text-[#249CFF] border border-[#249CFF]/40"
                    : "bg-[#171717] text-[#9CA3AF] border border-white/10"
                )}
              >
                <Vibrate className="h-4 w-4" />
                {vibrationEnabled ? "Vibração Ativa" : "Sem Vibração"}
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-condensed text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                <span>Volume dos Efeitos</span>
                <span className="text-white">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                aria-label="Volume dos efeitos sonoros"
                className="h-2 w-full accent-[#83FF36] cursor-pointer"
              />
            </div>
          </div>

          {/* Start Timer Sound (WORK) */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#83FF36]" />
              <h3 className="font-display text-lg uppercase tracking-wider text-[#83FF36]">
                Som para Iniciar o Timer (Work)
              </h3>
            </div>

            <div className="grid gap-2">
              {START_SOUND_OPTIONS.map((opt) => {
                const isSelected = startSound === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectStartSound(opt.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelectStartSound(opt.id);
                      }
                    }}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition cursor-pointer",
                      isSelected
                        ? "border-[#83FF36] bg-[#83FF36]/10"
                        : "border-white/10 bg-[#232323]/60 hover:border-white/25"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                          isSelected
                            ? "border-[#83FF36] bg-[#83FF36] text-[#0A0A0A]"
                            : "border-white/25"
                        )}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <p className="font-condensed text-base font-bold uppercase tracking-wider text-white">
                          {opt.name}
                        </p>
                        <p className="text-xs text-[#9CA3AF]">
                          {opt.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        audioService.unlock();
                        audioService.playStartSoundById(
                          opt.id,
                          Math.max(0.25, volume)
                        );
                      }}
                      aria-label={`Ouvir som ${opt.name}`}
                      className="flex items-center gap-1.5 rounded-xl bg-[#171717] px-3 py-1.5 font-condensed text-xs font-bold uppercase tracking-wider text-[#83FF36] transition hover:bg-white/10 cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      Ouvir
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* End Timer Sound (REST / FINISH) */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#FF3B30]" />
              <h3 className="font-display text-lg uppercase tracking-wider text-[#FF3B30]">
                Som para Finalizar / Descanso (Rest)
              </h3>
            </div>

            <div className="grid gap-2">
              {END_SOUND_OPTIONS.map((opt) => {
                const isSelected = endSound === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectEndSound(opt.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelectEndSound(opt.id);
                      }
                    }}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition cursor-pointer",
                      isSelected
                        ? "border-[#FF3B30] bg-[#FF3B30]/10"
                        : "border-white/10 bg-[#232323]/60 hover:border-white/25"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                          isSelected
                            ? "border-[#FF3B30] bg-[#FF3B30] text-white"
                            : "border-white/25"
                        )}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <p className="font-condensed text-base font-bold uppercase tracking-wider text-white">
                          {opt.name}
                        </p>
                        <p className="text-xs text-[#9CA3AF]">
                          {opt.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        audioService.unlock();
                        audioService.playEndSoundById(
                          opt.id,
                          Math.max(0.25, volume),
                          false
                        );
                      }}
                      aria-label={`Ouvir som ${opt.name}`}
                      className="flex items-center gap-1.5 rounded-xl bg-[#171717] px-3 py-1.5 font-condensed text-xs font-bold uppercase tracking-wider text-[#FF3B30] transition hover:bg-white/10 cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      Ouvir
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-white/10 px-6 py-4">
          <Button onClick={onClose}>Concluído</Button>
        </div>
      </div>
    </div>
  );
}

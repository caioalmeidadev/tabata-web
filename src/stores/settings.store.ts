import { create } from "zustand";
import type {
  EndTimerSoundId,
  StartTimerSoundId,
} from "@/services/audio.service";
import {
  DEFAULT_SETTINGS,
  storageService,
  type AppSettings,
} from "@/services/storage.service";

interface SettingsStore extends AppSettings {
  hydrated: boolean;
  hydrate: () => void;
  setAudioEnabled: (enabled: boolean) => void;
  toggleAudio: () => void;
  setVolume: (volume: number) => void;
  setVibrationEnabled: (enabled: boolean) => void;
  setAutoFullscreen: (enabled: boolean) => void;
  toggleAutoFullscreen: () => void;
  setStartSound: (sound: StartTimerSoundId) => void;
  setEndSound: (sound: EndTimerSoundId) => void;
}

function extractSettings(state: SettingsStore): AppSettings {
  return {
    audioEnabled: state.audioEnabled,
    volume: state.volume,
    vibrationEnabled: state.vibrationEnabled,
    autoFullscreen: state.autoFullscreen,
    startSound: state.startSound,
    endSound: state.endSound,
  };
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...DEFAULT_SETTINGS,
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    const saved = storageService.getSettings();
    set({ ...saved, hydrated: true });
  },

  setAudioEnabled: (audioEnabled) => {
    const next: AppSettings = { ...extractSettings(get()), audioEnabled };
    storageService.saveSettings(next);
    set({ audioEnabled });
  },

  toggleAudio: () => {
    const nextEnabled = !get().audioEnabled;
    get().setAudioEnabled(nextEnabled);
  },

  setVolume: (volume) => {
    const clamped = Math.min(1, Math.max(0, volume));
    const next: AppSettings = { ...extractSettings(get()), volume: clamped };
    storageService.saveSettings(next);
    set({ volume: clamped });
  },

  setVibrationEnabled: (vibrationEnabled) => {
    const next: AppSettings = { ...extractSettings(get()), vibrationEnabled };
    storageService.saveSettings(next);
    set({ vibrationEnabled });
  },

  setAutoFullscreen: (autoFullscreen) => {
    const next: AppSettings = { ...extractSettings(get()), autoFullscreen };
    storageService.saveSettings(next);
    set({ autoFullscreen });
  },

  toggleAutoFullscreen: () => {
    const nextVal = !get().autoFullscreen;
    get().setAutoFullscreen(nextVal);
  },

  setStartSound: (startSound) => {
    const next: AppSettings = { ...extractSettings(get()), startSound };
    storageService.saveSettings(next);
    set({ startSound });
  },

  setEndSound: (endSound) => {
    const next: AppSettings = { ...extractSettings(get()), endSound };
    storageService.saveSettings(next);
    set({ endSound });
  },
}));

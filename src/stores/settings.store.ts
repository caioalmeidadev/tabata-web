import { create } from "zustand";
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
    const next: AppSettings = {
      audioEnabled,
      volume: get().volume,
      vibrationEnabled: get().vibrationEnabled,
      autoFullscreen: get().autoFullscreen,
    };
    storageService.saveSettings(next);
    set({ audioEnabled });
  },

  toggleAudio: () => {
    const nextEnabled = !get().audioEnabled;
    get().setAudioEnabled(nextEnabled);
  },

  setVolume: (volume) => {
    const clamped = Math.min(1, Math.max(0, volume));
    const next: AppSettings = {
      audioEnabled: get().audioEnabled,
      volume: clamped,
      vibrationEnabled: get().vibrationEnabled,
      autoFullscreen: get().autoFullscreen,
    };
    storageService.saveSettings(next);
    set({ volume: clamped });
  },

  setVibrationEnabled: (vibrationEnabled) => {
    const next: AppSettings = {
      audioEnabled: get().audioEnabled,
      volume: get().volume,
      vibrationEnabled,
      autoFullscreen: get().autoFullscreen,
    };
    storageService.saveSettings(next);
    set({ vibrationEnabled });
  },

  setAutoFullscreen: (autoFullscreen) => {
    const next: AppSettings = {
      audioEnabled: get().audioEnabled,
      volume: get().volume,
      vibrationEnabled: get().vibrationEnabled,
      autoFullscreen,
    };
    storageService.saveSettings(next);
    set({ autoFullscreen });
  },

  toggleAutoFullscreen: () => {
    const nextVal = !get().autoFullscreen;
    get().setAutoFullscreen(nextVal);
  },
}));

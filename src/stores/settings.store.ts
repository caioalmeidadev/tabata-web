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
    const next = {
      audioEnabled,
      volume: get().volume,
      vibrationEnabled: get().vibrationEnabled,
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
    const next = {
      audioEnabled: get().audioEnabled,
      volume: clamped,
      vibrationEnabled: get().vibrationEnabled,
    };
    storageService.saveSettings(next);
    set({ volume: clamped });
  },

  setVibrationEnabled: (vibrationEnabled) => {
    const next = {
      audioEnabled: get().audioEnabled,
      volume: get().volume,
      vibrationEnabled,
    };
    storageService.saveSettings(next);
    set({ vibrationEnabled });
  },
}));

import type { Workout } from "@/types/workout";

export const STORAGE_KEYS = {
  WORKOUTS: "tabata.workouts",
  SETTINGS: "tabata.settings",
  LAST_WORKOUT: "tabata.lastWorkout",
} as const;

export interface AppSettings {
  audioEnabled: boolean;
  volume: number; // 0 to 1
  vibrationEnabled: boolean;
  autoFullscreen: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  audioEnabled: true,
  volume: 0.85,
  vibrationEnabled: true,
  autoFullscreen: false,
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export const storageService = {
  getWorkouts(): Workout[] {
    if (!isBrowser()) return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.WORKOUTS);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveWorkouts(workouts: Workout[]): void {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
    } catch {
      // Ignore quota errors
    }
  },

  getSettings(): AppSettings {
    if (!isBrowser()) return DEFAULT_SETTINGS;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!raw) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore quota errors
    }
  },

  getLastWorkoutId(): string | null {
    if (!isBrowser()) return null;
    try {
      return window.localStorage.getItem(STORAGE_KEYS.LAST_WORKOUT);
    } catch {
      return null;
    }
  },

  saveLastWorkoutId(id: string): void {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.LAST_WORKOUT, id);
    } catch {
      // Ignore quota errors
    }
  },
};

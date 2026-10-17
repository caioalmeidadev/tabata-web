import { create } from "zustand";
import { PRESET_WORKOUTS } from "@/constants/presets";
import { storageService } from "@/services/storage.service";
import type { Workout } from "@/types/workout";

interface WorkoutStore {
  customWorkouts: Workout[];
  lastWorkoutId: string | null;
  hydrated: boolean;

  hydrate: () => void;
  getAllWorkouts: () => Workout[];
  getWorkoutById: (id: string) => Workout | undefined;
  addWorkout: (
    data: Omit<Workout, "id" | "createdAt" | "updatedAt">
  ) => Workout;
  updateWorkout: (
    id: string,
    data: Partial<Omit<Workout, "id" | "createdAt">>
  ) => Workout | null;
  deleteWorkout: (id: string) => void;
  setLastWorkoutId: (id: string) => void;
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  customWorkouts: [],
  lastWorkoutId: null,
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    const saved = storageService.getWorkouts();
    const lastId = storageService.getLastWorkoutId();
    set({
      customWorkouts: saved,
      lastWorkoutId: lastId,
      hydrated: true,
    });
  },

  getAllWorkouts: () => {
    return [...PRESET_WORKOUTS, ...get().customWorkouts];
  },

  getWorkoutById: (id: string) => {
    const preset = PRESET_WORKOUTS.find((w) => w.id === id);
    if (preset) return preset;
    return get().customWorkouts.find((w) => w.id === id);
  },

  addWorkout: (data) => {
    const now = new Date().toISOString();
    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `workout-${Date.now()}`;

    const newWorkout: Workout = {
      ...data,
      id,
      isPreset: false,
      createdAt: now,
      updatedAt: now,
    };

    const nextList = [newWorkout, ...get().customWorkouts];
    storageService.saveWorkouts(nextList);
    set({ customWorkouts: nextList });
    return newWorkout;
  },

  updateWorkout: (id, data) => {
    const current = get().customWorkouts;
    const idx = current.findIndex((w) => w.id === id);

    // If user edits a preset, clone it as a custom workout or update custom
    if (idx === -1) return null;

    const updated: Workout = {
      ...current[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const nextList = [...current];
    nextList[idx] = updated;
    storageService.saveWorkouts(nextList);
    set({ customWorkouts: nextList });
    return updated;
  },

  deleteWorkout: (id) => {
    const nextList = get().customWorkouts.filter((w) => w.id !== id);
    storageService.saveWorkouts(nextList);
    set({ customWorkouts: nextList });
  },

  setLastWorkoutId: (id) => {
    storageService.saveLastWorkoutId(id);
    set({ lastWorkoutId: id });
  },
}));

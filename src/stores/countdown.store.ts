import { create } from "zustand";
import {
  computeEndsAt,
  computeRemainingMs,
  TimerEngineLoop,
} from "@/engine/timer-engine";
import { audioService } from "@/services/audio.service";
import { useSettingsStore } from "@/stores/settings.store";

export type CountdownStatus = "idle" | "running" | "paused" | "finished";

interface CountdownStore {
  status: CountdownStatus;
  durationSeconds: number;
  totalDurationMs: number;
  startedAt: number | null;
  endsAt: number | null;
  remainingMs: number;
  lastBeepSecond: number | null;

  setDurationSeconds: (seconds: number) => void;
  addSeconds: (deltaSeconds: number) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  finish: () => void;
  tick: () => void;
}

const countdownLoop = new TimerEngineLoop(50);

const DEFAULT_DURATION_SECONDS = 60;

export const useCountdownStore = create<CountdownStore>((set, get) => ({
  status: "idle",
  durationSeconds: DEFAULT_DURATION_SECONDS,
  totalDurationMs: DEFAULT_DURATION_SECONDS * 1000,
  startedAt: null,
  endsAt: null,
  remainingMs: DEFAULT_DURATION_SECONDS * 1000,
  lastBeepSecond: null,

  setDurationSeconds: (seconds: number) => {
    const clamped = Math.min(35999, Math.max(1, Math.floor(seconds)));
    const { status } = get();
    countdownLoop.stop();
    audioService.stop();
    set({
      durationSeconds: clamped,
      totalDurationMs: clamped * 1000,
      remainingMs: clamped * 1000,
      status: status === "idle" ? "idle" : "idle",
      startedAt: null,
      endsAt: null,
      lastBeepSecond: null,
    });
  },

  addSeconds: (deltaSeconds: number) => {
    const { status, durationSeconds, remainingMs, totalDurationMs, endsAt } =
      get();
    const deltaMs = deltaSeconds * 1000;

    if (status === "idle") {
      const nextSec = Math.min(
        35999,
        Math.max(5, durationSeconds + deltaSeconds)
      );
      set({
        durationSeconds: nextSec,
        totalDurationMs: nextSec * 1000,
        remainingMs: nextSec * 1000,
      });
      return;
    }

    if (status === "running" && endsAt !== null) {
      const now = Date.now();
      const currentRem = computeRemainingMs(endsAt, now);
      const nextRem = Math.max(1000, currentRem + deltaMs);
      const nextEndsAt = computeEndsAt(nextRem, now);
      set({
        endsAt: nextEndsAt,
        remainingMs: nextRem,
        totalDurationMs: Math.max(nextRem, totalDurationMs + deltaMs),
        lastBeepSecond: null,
      });
      return;
    }

    if (status === "paused") {
      const nextRem = Math.max(1000, remainingMs + deltaMs);
      set({
        remainingMs: nextRem,
        totalDurationMs: Math.max(nextRem, totalDurationMs + deltaMs),
        lastBeepSecond: null,
      });
    }
  },

  start: () => {
    const { durationSeconds } = get();
    const durationMs = Math.max(1, durationSeconds) * 1000;

    audioService.unlock();
    const { audioEnabled, volume, vibrationEnabled, startSound } =
      useSettingsStore.getState();

    if (audioEnabled) {
      audioService.playStartSoundById(startSound, volume);
    }
    if (vibrationEnabled) {
      audioService.vibrate(180);
    }

    const now = Date.now();
    set({
      status: "running",
      totalDurationMs: durationMs,
      startedAt: now,
      endsAt: computeEndsAt(durationMs, now),
      remainingMs: durationMs,
      lastBeepSecond: null,
    });

    countdownLoop.start(() => {
      get().tick();
    });
  },

  pause: () => {
    const { status, endsAt } = get();
    if (status !== "running") return;

    countdownLoop.stop();
    audioService.stop();
    const remainingMs = computeRemainingMs(endsAt);

    set({
      status: "paused",
      startedAt: null,
      endsAt: null,
      remainingMs,
    });
  },

  resume: () => {
    const { status, remainingMs } = get();
    if (status !== "paused") return;

    audioService.unlock();
    const now = Date.now();
    const endsAt = computeEndsAt(remainingMs, now);

    set({
      status: "running",
      startedAt: now,
      endsAt,
    });

    countdownLoop.start(() => {
      get().tick();
    });
  },

  reset: () => {
    const { durationSeconds } = get();
    countdownLoop.stop();
    audioService.stop();

    set({
      status: "idle",
      totalDurationMs: durationSeconds * 1000,
      startedAt: null,
      endsAt: null,
      remainingMs: durationSeconds * 1000,
      lastBeepSecond: null,
    });
  },

  finish: () => {
    countdownLoop.stop();
    const { audioEnabled, volume, vibrationEnabled, endSound } =
      useSettingsStore.getState();

    audioService.playWorkoutFinished(
      audioEnabled,
      volume,
      vibrationEnabled,
      endSound
    );

    set({
      status: "finished",
      startedAt: null,
      endsAt: null,
      remainingMs: 0,
      lastBeepSecond: null,
    });
  },

  tick: () => {
    const { status, endsAt, lastBeepSecond } = get();
    if (status !== "running" || endsAt === null) return;

    const remainingMs = computeRemainingMs(endsAt);
    const remainingSecCeil = Math.ceil(remainingMs / 1000);

    if (
      remainingSecCeil >= 1 &&
      remainingSecCeil <= 3 &&
      remainingSecCeil !== lastBeepSecond
    ) {
      const { audioEnabled, volume, vibrationEnabled } =
        useSettingsStore.getState();
      audioService.playCountdownBeep(audioEnabled, volume, vibrationEnabled);
      set({ lastBeepSecond: remainingSecCeil });
    }

    if (remainingMs <= 0) {
      get().finish();
      return;
    }

    set({ remainingMs });
  },
}));

import { create } from "zustand";
import { TimerEngineLoop } from "@/engine/timer-engine";
import { audioService } from "@/services/audio.service";
import { useSettingsStore } from "@/stores/settings.store";

export interface StopwatchLap {
  number: number;
  lapDurationMs: number;
  totalElapsedMs: number;
}

export type StopwatchStatus = "idle" | "running" | "paused";

interface StopwatchStore {
  status: StopwatchStatus;
  startedAt: number | null;
  accumulatedMs: number;
  elapsedMs: number;
  laps: StopwatchLap[];

  start: () => void;
  pause: () => void;
  resume: () => void;
  recordLap: () => void;
  reset: () => void;
  tick: () => void;
}

const stopwatchLoop = new TimerEngineLoop(25);

function computeCurrentElapsedMs(
  accumulatedMs: number,
  startedAt: number | null,
  now = Date.now()
): number {
  if (startedAt === null) return accumulatedMs;
  return accumulatedMs + Math.max(0, now - startedAt);
}

export const useStopwatchStore = create<StopwatchStore>((set, get) => ({
  status: "idle",
  startedAt: null,
  accumulatedMs: 0,
  elapsedMs: 0,
  laps: [],

  start: () => {
    const { status } = get();
    if (status === "running") return;

    audioService.unlock();
    const { audioEnabled, volume, vibrationEnabled, startSound } =
      useSettingsStore.getState();

    if (audioEnabled) {
      audioService.playStartSoundById(startSound, volume);
    }
    if (vibrationEnabled) {
      audioService.vibrate(120);
    }

    const now = Date.now();
    set({
      status: "running",
      startedAt: now,
      accumulatedMs: 0,
      elapsedMs: 0,
      laps: [],
    });

    stopwatchLoop.start(() => {
      get().tick();
    });
  },

  pause: () => {
    const { status, accumulatedMs, startedAt } = get();
    if (status !== "running") return;

    stopwatchLoop.stop();
    const now = Date.now();
    const totalElapsed = computeCurrentElapsedMs(accumulatedMs, startedAt, now);

    const { vibrationEnabled } = useSettingsStore.getState();
    if (vibrationEnabled) {
      audioService.vibrate(80);
    }

    set({
      status: "paused",
      startedAt: null,
      accumulatedMs: totalElapsed,
      elapsedMs: totalElapsed,
    });
  },

  resume: () => {
    const { status, accumulatedMs } = get();
    if (status !== "paused") return;

    audioService.unlock();
    const { vibrationEnabled } = useSettingsStore.getState();
    if (vibrationEnabled) {
      audioService.vibrate(80);
    }

    const now = Date.now();
    set({
      status: "running",
      startedAt: now,
      elapsedMs: accumulatedMs,
    });

    stopwatchLoop.start(() => {
      get().tick();
    });
  },

  recordLap: () => {
    const { status, accumulatedMs, startedAt, laps } = get();
    if (status !== "running") return;

    const now = Date.now();
    const totalElapsedMs = computeCurrentElapsedMs(
      accumulatedMs,
      startedAt,
      now
    );
    const previousTotalMs = laps.length > 0 ? laps[0].totalElapsedMs : 0;
    const lapDurationMs = Math.max(0, totalElapsedMs - previousTotalMs);

    const newLap: StopwatchLap = {
      number: laps.length + 1,
      lapDurationMs,
      totalElapsedMs,
    };

    const { audioEnabled, volume, vibrationEnabled } =
      useSettingsStore.getState();
    audioService.playLapBeep(audioEnabled, volume, vibrationEnabled);

    // Registra a volta sem interromper startedAt, status ou o loop
    set({
      elapsedMs: totalElapsedMs,
      laps: [newLap, ...laps],
    });
  },

  reset: () => {
    stopwatchLoop.stop();
    audioService.stop();
    set({
      status: "idle",
      startedAt: null,
      accumulatedMs: 0,
      elapsedMs: 0,
      laps: [],
    });
  },

  tick: () => {
    const { status, accumulatedMs, startedAt } = get();
    if (status !== "running" || startedAt === null) return;

    const elapsedMs = computeCurrentElapsedMs(accumulatedMs, startedAt);
    set({ elapsedMs });
  },
}));

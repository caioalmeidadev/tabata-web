import { create } from "zustand";
import {
  computeEndsAt,
  computeRemainingMs,
  TimerEngineLoop,
} from "@/engine/timer-engine";
import { buildWorkoutSteps } from "@/engine/workout-runner";
import { audioService } from "@/services/audio.service";
import { useSettingsStore } from "@/stores/settings.store";
import type { FlattenedStep, TimerState } from "@/types/timer";
import type { Workout } from "@/types/workout";

interface TimerStore {
  timer: TimerState;
  lastBeepSecond: number | null;

  start: (workout: Workout) => void;
  pause: () => void;
  resume: () => void;

  next: () => void;
  previous: () => void;

  stop: () => void;
  finish: () => void;

  tick: () => void;
}

const engineLoop = new TimerEngineLoop(50);

const INITIAL_TIMER_STATE: TimerState = {
  status: "idle",
  workout: null,
  currentCycle: 1,
  currentRound: 1,
  currentRepeat: 1,
  currentInterval: 0,
  currentStepIndex: 0,
  steps: [],
  startedAt: null,
  endsAt: null,
  remainingMs: 0,
};

function applyStepToState(
  workout: Workout,
  steps: FlattenedStep[],
  stepIndex: number,
  status: "running" | "paused"
): TimerState {
  const step = steps[stepIndex];
  const durationMs = step.duration * 1000;
  const now = Date.now();

  return {
    status,
    workout,
    currentCycle: step.cycle,
    currentRound: step.round,
    currentRepeat: step.repeat,
    currentInterval: step.intervalIndex,
    currentStepIndex: stepIndex,
    steps,
    startedAt: status === "running" ? now : null,
    endsAt: status === "running" ? computeEndsAt(durationMs, now) : null,
    remainingMs: durationMs,
  };
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  timer: INITIAL_TIMER_STATE,
  lastBeepSecond: null,

  start: (workout: Workout) => {
    const steps = buildWorkoutSteps(workout);
    if (steps.length === 0) return;

    audioService.unlock();
    const {
      audioEnabled,
      volume,
      vibrationEnabled,
      startSound,
      endSound,
    } = useSettingsStore.getState();

    const nextTimer = applyStepToState(workout, steps, 0, "running");
    set({ timer: nextTimer, lastBeepSecond: null });

    audioService.playIntervalTransition(
      steps[0].type,
      audioEnabled,
      volume,
      vibrationEnabled,
      startSound,
      endSound
    );

    engineLoop.start(() => {
      get().tick();
    });
  },

  pause: () => {
    const { timer } = get();
    if (timer.status !== "running") return;

    engineLoop.stop();
    audioService.stop();
    const remainingMs = computeRemainingMs(timer.endsAt);

    set({
      timer: {
        ...timer,
        status: "paused",
        startedAt: null,
        endsAt: null,
        remainingMs,
      },
    });
  },

  resume: () => {
    const { timer } = get();
    if (timer.status !== "paused") return;

    audioService.unlock();
    const now = Date.now();
    const endsAt = computeEndsAt(timer.remainingMs, now);

    set({
      timer: {
        ...timer,
        status: "running",
        startedAt: now,
        endsAt,
      },
    });

    engineLoop.start(() => {
      get().tick();
    });
  },

  next: () => {
    const { timer } = get();
    if (!timer.workout || timer.steps.length === 0) return;

    const nextIdx = timer.currentStepIndex + 1;
    if (nextIdx >= timer.steps.length) {
      get().finish();
      return;
    }

    const activeStatus = timer.status === "paused" ? "paused" : "running";
    const nextTimer = applyStepToState(
      timer.workout,
      timer.steps,
      nextIdx,
      activeStatus
    );

    const {
      audioEnabled,
      volume,
      vibrationEnabled,
      startSound,
      endSound,
    } = useSettingsStore.getState();
    audioService.playIntervalTransition(
      timer.steps[nextIdx].type,
      audioEnabled,
      volume,
      vibrationEnabled,
      startSound,
      endSound
    );

    set({ timer: nextTimer, lastBeepSecond: null });
  },

  previous: () => {
    const { timer } = get();
    if (!timer.workout || timer.steps.length === 0) return;

    audioService.stop();
    const prevIdx = Math.max(0, timer.currentStepIndex - 1);
    const activeStatus = timer.status === "paused" ? "paused" : "running";
    const nextTimer = applyStepToState(
      timer.workout,
      timer.steps,
      prevIdx,
      activeStatus
    );

    set({ timer: nextTimer, lastBeepSecond: null });
  },

  stop: () => {
    engineLoop.stop();
    audioService.stop();
    set({
      timer: INITIAL_TIMER_STATE,
      lastBeepSecond: null,
    });
  },

  finish: () => {
    const { timer } = get();
    engineLoop.stop();

    const { audioEnabled, volume, vibrationEnabled, endSound } =
      useSettingsStore.getState();
    audioService.playWorkoutFinished(
      audioEnabled,
      volume,
      vibrationEnabled,
      endSound
    );

    set({
      timer: {
        ...timer,
        status: "finished",
        startedAt: null,
        endsAt: null,
        remainingMs: 0,
      },
      lastBeepSecond: null,
    });
  },

  tick: () => {
    const { timer, lastBeepSecond } = get();
    if (timer.status !== "running" || timer.endsAt === null) return;

    const remainingMs = computeRemainingMs(timer.endsAt);
    const remainingSecCeil = Math.ceil(remainingMs / 1000);

    // Trigger countdown beep at 3, 2, 1 seconds remaining
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
      get().next();
      return;
    }

    set((state) => ({
      timer: {
        ...state.timer,
        remainingMs,
      },
    }));
  },
}));

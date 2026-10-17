import type { IntervalType } from "@/types/workout";

class AudioAndHapticsService {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock(): void {
    this.getContext();
  }

  private playTone(
    freq: number,
    durationSec: number,
    volume: number,
    type: OscillatorType = "sine",
    startTimeOffsetSec = 0
  ): void {
    const ctx = this.getContext();
    if (!ctx || volume <= 0) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + startTimeOffsetSec;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(Math.min(1, Math.max(0.01, volume * 0.45)), startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + durationSec);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + durationSec);
    } catch {
      // Ignore audio errors when context is blocked
    }
  }

  /**
   * Short countdown beep (last 3, 2, 1 seconds)
   */
  public playCountdownBeep(enabled: boolean, volume: number, vibrateEnabled: boolean): void {
    if (enabled) {
      this.playTone(660, 0.12, volume, "triangle");
    }
    if (vibrateEnabled) {
      this.vibrate(80);
    }
  }

  /**
   * Sound & vibration when entering a new interval state
   */
  public playIntervalTransition(
    intervalType: IntervalType,
    enabled: boolean,
    volume: number,
    vibrateEnabled: boolean
  ): void {
    if (enabled) {
      if (intervalType === "work") {
        // Energetic ascending double tone for WORK
        this.playTone(784, 0.12, volume, "square", 0);
        this.playTone(1046.5, 0.28, volume, "square", 0.11);
      } else if (intervalType === "rest" || intervalType === "cooldown") {
        // Calming descending tone for REST
        this.playTone(587.33, 0.15, volume, "sine", 0);
        this.playTone(440, 0.25, volume, "sine", 0.14);
      } else {
        // Prepare tone
        this.playTone(523.25, 0.18, volume, "triangle", 0);
      }
    }

    if (vibrateEnabled) {
      this.vibrate(200);
    }
  }

  /**
   * Fanfare sound & double vibration on workout completion
   */
  public playWorkoutFinished(
    enabled: boolean,
    volume: number,
    vibrateEnabled: boolean
  ): void {
    if (enabled) {
      this.playTone(523.25, 0.15, volume, "triangle", 0);
      this.playTone(659.25, 0.15, volume, "triangle", 0.15);
      this.playTone(783.99, 0.15, volume, "triangle", 0.3);
      this.playTone(1046.5, 0.45, volume, "square", 0.45);
    }

    if (vibrateEnabled) {
      this.vibrate([220, 100, 320]);
    }
  }

  public vibrate(pattern: number | number[]): void {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore on unsupported devices
      }
    }
  }
}

export const audioService = new AudioAndHapticsService();

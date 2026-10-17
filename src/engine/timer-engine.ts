/**
 * Timestamp-based Timer Engine
 * Uses Date.now() as the single source of truth to prevent setInterval drift.
 */

export function computeEndsAt(durationMs: number, now = Date.now()): number {
  return now + Math.max(0, durationMs);
}

export function computeRemainingMs(
  endsAt: number | null,
  now = Date.now()
): number {
  if (endsAt === null) return 0;
  return Math.max(0, endsAt - now);
}

export class TimerEngineLoop {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly tickRateMs: number;

  constructor(tickRateMs = 50) {
    this.tickRateMs = tickRateMs;
  }

  start(onTick: () => void): void {
    this.stop();
    this.intervalId = setInterval(() => {
      onTick();
    }, this.tickRateMs);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  isRunning(): boolean {
    return this.intervalId !== null;
  }
}

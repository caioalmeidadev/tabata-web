import type { IntervalType } from "@/types/workout";

export type StartTimerSoundId =
  | "boxing-bell"
  | "coach-whistle"
  | "air-horn"
  | "iron-clank"
  | "digital-beep";

export type EndTimerSoundId =
  | "double-gong"
  | "gym-buzzer"
  | "double-whistle"
  | "heavy-drop"
  | "classic-chime";

export interface SoundOption<T extends string> {
  id: T;
  name: string;
  description: string;
}

export const START_SOUND_OPTIONS: SoundOption<StartTimerSoundId>[] = [
  {
    id: "boxing-bell",
    name: "Gongo de Boxe",
    description: "Campainha metálica clássica de início de round",
  },
  {
    id: "coach-whistle",
    name: "Apito de Treinador",
    description: "Silvo agudo vibrante de treino funcional / HIIT",
  },
  {
    id: "air-horn",
    name: "Buzina de Crossfit",
    description: "Sirene potente de ginásio e box de treino",
  },
  {
    id: "iron-clank",
    name: "Anilha Olímpica",
    description: "Impacto metálico de anilhas de ferro na barra",
  },
  {
    id: "digital-beep",
    name: "Beep Digital Esportivo",
    description: "Toque duplo ascendente de cronômetro profissional",
  },
];

export const END_SOUND_OPTIONS: SoundOption<EndTimerSoundId>[] = [
  {
    id: "double-gong",
    name: "Gongo Duplo de Fim",
    description: "Duas batidas rápidas no gongo indicando descanso/fim",
  },
  {
    id: "gym-buzzer",
    name: "Sirene de Placar (Buzzer)",
    description: "Toque grave de encerramento de tempo de quadra",
  },
  {
    id: "double-whistle",
    name: "Apito Duplo de Parada",
    description: "Dois apitos curtos de encerramento de série",
  },
  {
    id: "heavy-drop",
    name: "Queda de Barra no Piso",
    description: "Impacto pesado de halter/barra no tatame de borracha",
  },
  {
    id: "classic-chime",
    name: "Alerta Clássico",
    description: "Sinal descendente suave e fanfarra de conclusão",
  },
];

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
    startTimeOffsetSec = 0,
    endFreq?: number
  ): void {
    const ctx = this.getContext();
    if (!ctx || volume <= 0) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + startTimeOffsetSec;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      if (endFreq && endFreq !== freq) {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(20, endFreq),
          startTime + durationSec
        );
      }

      gain.gain.setValueAtTime(
        Math.min(1, Math.max(0.01, volume * 0.48)),
        startTime
      );
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + durationSec);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + durationSec);
    } catch {
      // Ignore audio errors when context is blocked
    }
  }

  private playNoiseBurst(
    durationSec: number,
    volume: number,
    filterFreq: number,
    startTimeOffsetSec = 0
  ): void {
    const ctx = this.getContext();
    if (!ctx || volume <= 0) return;

    try {
      const bufferSize = Math.floor(ctx.sampleRate * durationSec);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = filterFreq;
      filter.Q.value = 2.5;

      const gain = ctx.createGain();
      const startTime = ctx.currentTime + startTimeOffsetSec;
      gain.gain.setValueAtTime(
        Math.min(1, Math.max(0.01, volume * 0.35)),
        startTime
      );
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + durationSec);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(startTime);
      noise.stop(startTime + durationSec);
    } catch {
      // Ignore audio errors
    }
  }

  private triggerBoxingBell(volume: number, offsetSec = 0): void {
    // Metallic partials for authentic boxing ring bell
    this.playTone(780, 0.85, volume * 0.9, "sine", offsetSec);
    this.playTone(1560, 0.65, volume * 0.7, "triangle", offsetSec);
    this.playTone(2380, 0.45, volume * 0.55, "sine", offsetSec);
    this.playTone(3120, 0.25, volume * 0.4, "square", offsetSec);
    this.playNoiseBurst(0.05, volume * 0.6, 2500, offsetSec);
  }

  private triggerWhistle(volume: number, durationSec = 0.38, offsetSec = 0): void {
    const ctx = this.getContext();
    if (!ctx || volume <= 0) return;

    try {
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const mainGain = ctx.createGain();
      const startTime = ctx.currentTime + offsetSec;

      // Whistle carrier + pea trill modulation (42Hz)
      osc.type = "sine";
      osc.frequency.setValueAtTime(2880, startTime);

      lfo.type = "sine";
      lfo.frequency.setValueAtTime(42, startTime);
      lfoGain.gain.setValueAtTime(160, startTime);

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      mainGain.gain.setValueAtTime(0.01, startTime);
      mainGain.gain.linearRampToValueAtTime(
        Math.min(1, volume * 0.48),
        startTime + 0.03
      );
      mainGain.gain.exponentialRampToValueAtTime(
        0.001,
        startTime + durationSec
      );

      osc.connect(mainGain);
      mainGain.connect(ctx.destination);

      osc.start(startTime);
      lfo.start(startTime);
      osc.stop(startTime + durationSec);
      lfo.stop(startTime + durationSec);

      // Breath air noise
      this.playNoiseBurst(durationSec, volume * 0.25, 2900, offsetSec);
    } catch {
      // Ignore audio errors
    }
  }

  private triggerAirHorn(volume: number, offsetSec = 0): void {
    this.playTone(370, 0.52, volume * 0.65, "sawtooth", offsetSec);
    this.playTone(440, 0.52, volume * 0.65, "sawtooth", offsetSec);
    this.playTone(554.37, 0.52, volume * 0.65, "sawtooth", offsetSec);
    this.playNoiseBurst(0.18, volume * 0.3, 1200, offsetSec);
  }

  private triggerIronClank(volume: number, offsetSec = 0): void {
    // Heavy barbell plate clank
    this.playNoiseBurst(0.08, volume * 0.9, 1800, offsetSec);
    this.playTone(420, 0.25, volume * 0.8, "triangle", offsetSec, 180);
    this.playTone(1180, 0.42, volume * 0.7, "sine", offsetSec);
    this.playTone(1890, 0.32, volume * 0.5, "triangle", offsetSec + 0.02);
    this.playTone(2640, 0.22, volume * 0.4, "sine", offsetSec + 0.03);
  }

  private triggerGymBuzzer(volume: number, durationSec = 0.55, offsetSec = 0): void {
    this.playTone(146.83, durationSec, volume * 0.85, "sawtooth", offsetSec);
    this.playTone(152, durationSec, volume * 0.75, "square", offsetSec);
    this.playTone(293.66, durationSec, volume * 0.5, "sawtooth", offsetSec);
  }

  private triggerHeavyDrop(volume: number, offsetSec = 0): void {
    // Sub-bass thud + metallic rattle
    this.playTone(135, 0.38, volume * 1.0, "sine", offsetSec, 32);
    this.playTone(90, 0.32, volume * 0.85, "triangle", offsetSec, 28);
    this.playNoiseBurst(0.14, volume * 0.65, 450, offsetSec);
    this.playTone(980, 0.12, volume * 0.35, "triangle", offsetSec + 0.08);
  }

  /**
   * Play customized start sound (used for WORK start & preview)
   */
  public playStartSoundById(soundId: StartTimerSoundId, volume: number): void {
    switch (soundId) {
      case "boxing-bell":
        this.triggerBoxingBell(volume, 0);
        break;
      case "coach-whistle":
        this.triggerWhistle(volume, 0.42, 0);
        break;
      case "air-horn":
        this.triggerAirHorn(volume, 0);
        break;
      case "iron-clank":
        this.triggerIronClank(volume, 0);
        break;
      case "digital-beep":
      default:
        this.playTone(784, 0.12, volume, "square", 0);
        this.playTone(1046.5, 0.28, volume, "square", 0.11);
        break;
    }
  }

  /**
   * Play customized end sound (used for REST start, workout finish & preview)
   */
  public playEndSoundById(
    soundId: EndTimerSoundId,
    volume: number,
    isFinalComplete = false
  ): void {
    switch (soundId) {
      case "double-gong":
        this.triggerBoxingBell(volume, 0);
        this.triggerBoxingBell(volume, 0.24);
        if (isFinalComplete) {
          this.triggerBoxingBell(volume, 0.48);
        }
        break;
      case "gym-buzzer":
        this.triggerGymBuzzer(volume, isFinalComplete ? 0.85 : 0.5, 0);
        break;
      case "double-whistle":
        this.triggerWhistle(volume, 0.18, 0);
        this.triggerWhistle(volume, isFinalComplete ? 0.5 : 0.28, 0.23);
        break;
      case "heavy-drop":
        this.triggerHeavyDrop(volume, 0);
        if (isFinalComplete) {
          this.triggerHeavyDrop(volume, 0.28);
        }
        break;
      case "classic-chime":
      default:
        if (isFinalComplete) {
          this.playTone(523.25, 0.15, volume, "triangle", 0);
          this.playTone(659.25, 0.15, volume, "triangle", 0.15);
          this.playTone(783.99, 0.15, volume, "triangle", 0.3);
          this.playTone(1046.5, 0.45, volume, "square", 0.45);
        } else {
          this.playTone(587.33, 0.15, volume, "sine", 0);
          this.playTone(440, 0.25, volume, "sine", 0.14);
        }
        break;
    }
  }

  /**
   * Short countdown beep (last 3, 2, 1 seconds)
   */
  public playCountdownBeep(
    enabled: boolean,
    volume: number,
    vibrateEnabled: boolean
  ): void {
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
    vibrateEnabled: boolean,
    startSound: StartTimerSoundId = "boxing-bell",
    endSound: EndTimerSoundId = "double-gong"
  ): void {
    if (enabled) {
      if (intervalType === "work") {
        this.playStartSoundById(startSound, volume);
      } else if (intervalType === "rest" || intervalType === "cooldown") {
        this.playEndSoundById(endSound, volume, false);
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
   * Sound & double vibration on workout completion
   */
  public playWorkoutFinished(
    enabled: boolean,
    volume: number,
    vibrateEnabled: boolean,
    endSound: EndTimerSoundId = "double-gong"
  ): void {
    if (enabled) {
      this.playEndSoundById(endSound, volume, true);
    }

    if (vibrateEnabled) {
      this.vibrate([220, 100, 320]);
    }
  }

  public vibrate(pattern: number | number[]): void {
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.vibrate === "function"
    ) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore on unsupported devices
      }
    }
  }
}

export const audioService = new AudioAndHapticsService();

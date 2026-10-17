import type { Workout } from "@/types/workout";

export const PRESET_WORKOUTS: Workout[] = [
  {
    id: "preset-classic-tabata",
    name: "Classic Tabata",
    color: "#83FF36",
    prepareDuration: 10,
    cycles: 1,
    restBetweenCycles: 0,
    isPreset: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    rounds: [
      {
        id: "round-classic-1",
        name: "Tabata Principal",
        repeats: 8,
        intervals: [
          {
            id: "int-classic-work",
            name: "Sprint / Esforço Máximo",
            type: "work",
            duration: 20,
          },
          {
            id: "int-classic-rest",
            name: "Recuperação",
            type: "rest",
            duration: 10,
          },
        ],
      },
    ],
  },
  {
    id: "preset-hiit",
    name: "HIIT",
    color: "#249CFF",
    prepareDuration: 10,
    cycles: 1,
    restBetweenCycles: 0,
    isPreset: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    rounds: [
      {
        id: "round-hiit-1",
        name: "Circuito HIIT",
        repeats: 10,
        intervals: [
          {
            id: "int-hiit-work",
            name: "Alta Intensidade",
            type: "work",
            duration: 40,
          },
          {
            id: "int-hiit-rest",
            name: "Descanso Ativo",
            type: "rest",
            duration: 20,
          },
        ],
      },
    ],
  },
];

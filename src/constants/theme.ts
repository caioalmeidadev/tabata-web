export const THEME_COLORS = {
  background: "#0A0A0A",
  surface: "#171717",
  surfaceElevated: "#232323",
  textPrimary: "#FFFFFF",
  textSecondary: "#9CA3AF",
  prepare: "#FFFF2E",
  work: "#83FF36",
  rest: "#FF3B30",
  cooldown: "#249CFF",
  repeats: "#249CFF",
  cycles: "#FFC62E",
} as const;

export const WORKOUT_ACCENT_COLORS = [
  { name: "Neon Green", value: "#83FF36" },
  { name: "Electric Yellow", value: "#FFFF2E" },
  { name: "Vibrant Red", value: "#FF3B30" },
  { name: "Cyber Blue", value: "#249CFF" },
  { name: "Amber Gold", value: "#FFC62E" },
  { name: "Hyper Orange", value: "#FF6B00" },
] as const;

export const INTERVAL_TYPE_META = {
  prepare: {
    label: "PREPARE",
    ptLabel: "Preparar",
    bgHex: THEME_COLORS.prepare,
    textColor: "#0A0A0A",
    badgeClass: "bg-[#FFFF2E] text-[#0A0A0A]",
  },
  work: {
    label: "WORK",
    ptLabel: "Trabalho",
    bgHex: THEME_COLORS.work,
    textColor: "#0A0A0A",
    badgeClass: "bg-[#83FF36] text-[#0A0A0A]",
  },
  rest: {
    label: "REST",
    ptLabel: "Descanso",
    bgHex: THEME_COLORS.rest,
    textColor: "#FFFFFF",
    badgeClass: "bg-[#FF3B30] text-white",
  },
  cooldown: {
    label: "COOLDOWN",
    ptLabel: "Desaquecimento",
    bgHex: THEME_COLORS.cooldown,
    textColor: "#0A0A0A",
    badgeClass: "bg-[#249CFF] text-[#0A0A0A]",
  },
} as const;

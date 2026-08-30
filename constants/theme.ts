// Raw hex values for use where NativeWind className can't reach
// (e.g. LinearGradient colors, icon `color` props, placeholderTextColor).
// Keep in sync with the `brand` palette in tailwind.config.js.

export const COLORS = {
  primary: "#DC1E3D",
  background: "#0B0B0D",
  surface: "#17171A",
  muted: "#8C8C91",
  brand: {
    bg: "#000000",
    body: "#F5F5F4",
    surface: "#151517",
    surfaceBorder: "#2A2A2E",
    textPrimary: "#FFFFFF",
    textSecondary: "#A6A6AA",
    textMuted: "#5A5A5F",
    red: "#DC1E3D",
    redDim: "#8F1428",
    redGlow: "#FF3B5C",
    success: "#3DDC84",
  },
  placeholder: "#8C8C91",
} as const;

export const AI_GRADIENT: [string, string] = [
  COLORS.brand.redDim,
  COLORS.brand.red,
];

export const AI_GRADIENT_REVERSE: [string, string] = [
  COLORS.brand.red,
  COLORS.brand.redDim,
];

export const RECORDING_GRADIENT: [string, string] = [
  COLORS.brand.red,
  COLORS.brand.redGlow,
];

export const HERO_GRADIENT_COLORS = [
  COLORS.brand.bg,
  COLORS.brand.red,
  COLORS.brand.bg,
] as const;

export const HERO_GRADIENT_LOCATIONS = [0, 0.72, 1] as const;
export const HERO_GRADIENT_START = { x: 0, y: 0 } as const;
export const HERO_GRADIENT_END = { x: 1, y: 1 } as const;

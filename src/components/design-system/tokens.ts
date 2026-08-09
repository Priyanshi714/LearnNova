/**
 * Design Tokens for LearnNova Premium Design System
 * Helps centralize styling references and prevent hardcoding.
 */

export const colors = {
  primary: "var(--primary)",
  primaryForeground: "var(--primary-foreground)",
  primaryGlow: "var(--primary-glow)",
  secondary: "var(--secondary)",
  secondaryForeground: "var(--secondary-foreground)",
  muted: "var(--muted)",
  mutedForeground: "var(--muted-foreground)",
  accent: "var(--accent)",
  accentForeground: "var(--accent-foreground)",
  destructive: "var(--destructive)",
  destructiveForeground: "var(--destructive-foreground)",
  success: "var(--success)",
  warning: "var(--warning)",
  border: "var(--border)",
  input: "var(--input)",
  ring: "var(--ring)",
  background: "var(--background)",
  foreground: "var(--foreground)",
  card: "var(--card)",
  cardForeground: "var(--card-foreground)",
} as const;

export const spacing = {
  xs: "ds-xs", // 4px
  sm: "ds-sm", // 8px
  md: "ds-md", // 12px
  lg: "ds-lg", // 16px
  xl: "ds-xl", // 24px
  "2xl": "ds-2xl", // 32px
  "3xl": "ds-3xl", // 48px
} as const;

export const radius = {
  xs: "rounded-sm",
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
  xl: "rounded-2xl",
  full: "rounded-full",
} as const;

export const shadows = {
  sm: "shadow-ds-sm",
  md: "shadow-ds-md",
  lg: "shadow-ds-lg",
  glow: "shadow-ds-glow",
  glowStrong: "shadow-ds-glow-strong",
} as const;

export const blurs = {
  sm: "backdrop-blur-ds-sm",
  md: "backdrop-blur-ds-md",
  lg: "backdrop-blur-ds-lg",
  xl: "backdrop-blur-ds-xl",
} as const;

export const transitions = {
  fast: "duration-150 transition-all",
  normal: "duration-200 transition-all",
  slow: "duration-300 transition-all",
  spring: "duration-300 transition-all ease-out",
} as const;

export const fontSizes = {
  xs: "text-ds-xs",
  sm: "text-ds-sm",
  base: "text-ds-base",
  lg: "text-ds-lg",
  xl: "text-ds-xl",
  "2xl": "text-ds-2xl",
  "3xl": "text-ds-3xl",
  "4xl": "text-ds-4xl",
} as const;

export const fontWeights = {
  light: "font-light",
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
} as const;

export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export const zIndex = {
  dropdown: "z-10",
  sticky: "z-20",
  overlay: "z-30",
  modal: "z-40",
  tooltip: "z-50",
} as const;

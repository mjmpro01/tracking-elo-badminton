// Central color palette for the mobile admin app.
// Đảm bảo chỉ khai báo MỘT biến `colors` duy nhất để tránh lỗi "Identifier 'colors' has already been declared".

export const lightColors = {
  // Primary brand colors (match HTML design)
  primary: "#2b6cee",
  primaryMuted: "#137fec",

  // Backgrounds
  backgroundLight: "#f6f6f8",
  backgroundDark: "#101622",

  // Surfaces
  surfaceLight: "#ffffff",
  surfaceDark: "#111827",
  surface: "#ffffff",

  // Borders
  borderLight: "#e5e7eb",
  borderDark: "#1f2937",
  border: "#d5d7e1",

  // Text
  textMain: "#101622",
  textMainLight: "#111827",
  textMainDark: "#f9fafb",
  textPrimary: "#101622",
  textSecondary: "#5b6270",
  textMuted: "#9ca3af",

  // Status colors
  success: "#22c55e",
  error: "#ef4444",
  warning: "#facc15",
  danger: "#e5484d",
} as const;

export const darkColors = {
  // Primary brand colors (same in dark mode)
  primary: "#3b82f6",
  primaryMuted: "#60a5fa",

  // Backgrounds
  backgroundLight: "#0f172a",
  backgroundDark: "#020617",

  // Surfaces
  surfaceLight: "#1e293b",
  surfaceDark: "#0f172a",
  surface: "#1e293b",

  // Borders
  borderLight: "#334155",
  borderDark: "#475569",
  border: "#334155",

  // Text
  textMain: "#f1f5f9",
  textMainLight: "#f9fafb",
  textMainDark: "#e2e8f0",
  textPrimary: "#f1f5f9",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",

  // Status colors
  success: "#22c55e",
  error: "#ef4444",
  warning: "#facc15",
  danger: "#e5484d",
} as const;

// Default export để backward compatibility
export const colors = lightColors;
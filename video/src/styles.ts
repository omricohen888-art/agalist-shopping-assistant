// Agalist Design System Constants
export const COLORS = {
  white: "#FFFFFF",
  black: "#000000",
  brandYellow: "#FFC107",
  brandGold: "#FFD700",
  gray100: "#F5F5F5",
  gray200: "#EEEEEE",
  gray300: "#E0E0E0",
  gray400: "#BDBDBD",
  gray600: "#757575",
  gray800: "#424242",
  green500: "#4CAF50",
  green600: "#388E3C",
  red400: "#EF5350",
  blue500: "#2196F3",
} as const;

export const FONTS = {
  hebrewBold: "'Segoe UI', 'Arial', sans-serif",
  hebrewRegular: "'Segoe UI', 'Arial', sans-serif",
} as const;

// Timeline constants (frames at 30fps)
export const TIMELINE = {
  FPS: 30,
  TOTAL: 600,
  // Scene 1: Phone enters (0-3s)
  PHONE_ENTER_START: 0,
  PHONE_ENTER_END: 90,
  // Scene 2: Typing items (3-8s)
  TYPING_START: 90,
  TYPING_END: 240,
  // Scene 3: Shopping mode - checking items (8-13s)
  SHOPPING_START: 240,
  SHOPPING_END: 390,
  // Scene 4: Finish flow (13-16s)
  FINISH_START: 390,
  FINISH_END: 480,
  // Scene 5: Logo reveal (16-20s)
  LOGO_START: 480,
  LOGO_END: 600,
} as const;

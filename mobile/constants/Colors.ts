/**
 * Kinetic Stadium design tokens (Stitch)
 */
export const colors = {
  background: "#fbf9f8",
  surface: "#ffffff",
  surfaceLow: "#f6f3f2",
  surfaceContainer: "#f0eded",
  surfaceHigh: "#eae8e7",
  surfaceHighest: "#e4e2e1",
  surfaceDim: "#dcd9d9",

  primary: "#bc0007",
  primaryBright: "#e90d11",
  onPrimary: "#ffffff",
  secondary: "#1b5bb8",
  secondaryBright: "#6d9fff",
  onSecondary: "#ffffff",
  tertiary: "#c4aa00",
  tertiaryBright: "#ffe24a",
  onTertiary: "#211b00",
  tertiaryContainer: "#ffe24a",
  onTertiaryContainer: "#211b00",

  onSurface: "#1b1c1c",
  onSurfaceVariant: "#5e3f3a",
  muted: "rgba(27,28,28,0.55)",
  muted2: "rgba(27,28,28,0.38)",

  outline: "#936e69",
  outlineVariant: "#e9bcb6",
  border: "rgba(27,28,28,0.08)",
  glass: "rgba(255,255,255,0.88)",
  glassBorder: "rgba(255,255,255,0.55)",

  success: "#1b7a3d",
  error: "#ba1a1a",
  white: "#FFFFFF",
  black: "#000000",

  pokeball: "#EE1515",
  pokeballWhite: "#F5F5F5",

  slateDeep: "#fbf9f8",
  slateCard: "#ffffff",
  slate: "#f0eded",
  pikachu: "#bc0007",
};

export const fonts = {
  headline: "Montserrat_700Bold",
  headlineExtra: "Montserrat_800ExtraBold",
  label: "Montserrat_600SemiBold",
  body: "Quicksand_500Medium",
  bodyBold: "Quicksand_700Bold",
};

export const theme = {
  dark: false,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.onSurface,
    border: colors.border,
    notification: colors.primary,
  },
};

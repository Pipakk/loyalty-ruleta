import type { ThemePalette } from "../base/types";

/**
 * Manicura y estética: colores pastel claros (rosa, melocotón, lavanda, menta).
 * Fondo y UI muy suaves; ruleta en tonos pastel.
 */
const ESTHETIC_WHEEL = [
  "#F8D7DA", "#F5C6CB", "#E8D4E4", "#D4E8E0", "#FDE4E1", "#E8E0F0",
];

export const estheticPalette: ThemePalette = {
  primary: "#D4A5A5",
  primaryDark: "#C49595",
  secondary: "#C9B896",
  background: "#FEFBFB",
  surface: "#F8F2F4",
  text: "#4A4245",
  textSoft: "#7A7275",
  white: "#FFFFFF",
  border: "rgba(212, 165, 165, 0.25)",
  borderFocus: "#C49595",
  shadow: "rgba(74, 66, 69, 0.05)",
  accent: "#B8A0A8",
  ready: "#8BB89A",
  wheelSegmentColors: ESTHETIC_WHEEL,
  wheelPointerColor: "#B8A0A8",
};

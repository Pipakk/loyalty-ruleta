import type { Theme } from "../base/types";
import { baseTokens } from "../base/tokens";
import { estheticPalette } from "./palette";
import { EstheticStamp } from "./components/Stamp";

/**
 * Manicura y estética: paleta blush/rosa/dorado, sellos con icono de uñas.
 */
export const estheticTheme: Theme = {
  key: "esthetic",
  tokens: baseTokens,
  color: estheticPalette,
  components: {
    Stamp: EstheticStamp,
  },
};

"use client";

import type { StampProps } from "../../base/types";
import { estheticPalette } from "../palette";

/**
 * Manicura/estética: sello conseguido = círculo con emoji de uñas.
 * Sello vacío = punto pequeño.
 */
export function EstheticStamp({ filled }: StampProps) {
  const size = 28;

  if (!filled) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title="Sello pendiente"
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: estheticPalette.primary,
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `2px solid ${estheticPalette.primary}`,
        background: estheticPalette.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      title="Sello conseguido"
    >
      <span style={{ fontSize: 16, lineHeight: 1 }} aria-hidden>💅</span>
    </div>
  );
}

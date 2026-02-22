"use client";

import type { StampProps } from "../../base/types";
import { barberPalette } from "../palette";

/**
 * Barbería: sello conseguido = círculo con emoji de tijeras dentro.
 * Sello no conseguido = punto negro pequeño para que se vea.
 */
export function BarberStamp({ filled }: StampProps) {
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
            background: "#1A1A1A",
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
        border: `2px solid ${barberPalette.secondary}`,
        background: barberPalette.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      title="Sello conseguido"
    >
      <span style={{ fontSize: 16, lineHeight: 1 }} aria-hidden>✂️</span>
    </div>
  );
}

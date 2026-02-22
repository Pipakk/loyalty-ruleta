"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/Button";

/**
 * Extrae token y slug de una URL de claim-stamp: /b/[slug]/claim-stamp?t=TOKEN
 */
export function parseClaimStampUrl(urlString: string): { slug: string; token: string } | null {
  try {
    const u = new URL(urlString);
    const match = u.pathname.match(/^\/b\/([^/]+)\/claim-stamp$/);
    if (!match) return null;
    const token = u.searchParams.get("t");
    if (!token) return null;
    return { slug: match[1], token };
  } catch {
    return null;
  }
}

type Props = {
  onScan: (token: string) => void;
  onClose: () => void;
  isSameSlug: (slug: string) => boolean;
  errorMessage?: string;
};

export function StampQRScanner({ onScan, onClose, isSameSlug, errorMessage }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const readerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "stamp-qr-reader";

  useEffect(() => {
    let mounted = true;
    setError(null);
    setScanning(true);

    Html5Qrcode.getCameras()
      .then((cameras) => {
        if (!mounted) return;
        if (!cameras?.length) {
          setError("No se detectó ninguna cámara.");
          setScanning(false);
          return;
        }
        const backend = cameras.length > 1 ? cameras[1].id : cameras[0].id;
        const html5Qr = new Html5Qrcode(containerId);
        readerRef.current = html5Qr;
        return html5Qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            if (!mounted) return;
            const parsed = parseClaimStampUrl(decodedText);
            if (!parsed) return;
            if (!isSameSlug(parsed.slug)) {
              setError("Este QR no es de este establecimiento.");
              return;
            }
            html5Qr.stop().catch(() => {});
            readerRef.current = null;
            onScan(parsed.token);
          },
          () => {}
        );
      })
      .catch((e) => {
        if (mounted) {
          setError(e?.message || "No se pudo acceder a la cámara.");
          setScanning(false);
        }
      });

    return () => {
      mounted = false;
      if (readerRef.current) {
        readerRef.current.stop().catch(() => {});
        readerRef.current = null;
      }
    };
  }, [onScan, isSameSlug]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "#111",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 16,
      }}
    >
      <div style={{ alignSelf: "stretch", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ color: "#fff", fontSize: 16 }}>Escanea el QR del establecimiento</span>
        <Button variant="secondary" onClick={onClose}>Cerrar</Button>
      </div>
      {(error || errorMessage) && (
        <p style={{ color: "#f87171", fontSize: 14, marginBottom: 8 }}>{error || errorMessage}</p>
      )}
      <div id={containerId} style={{ width: "100%", maxWidth: 280, flex: 1, minHeight: 280 }} />
      {!scanning && !error && <p style={{ color: "#888", fontSize: 13 }}>Apunta al QR del local.</p>}
    </div>
  );
}

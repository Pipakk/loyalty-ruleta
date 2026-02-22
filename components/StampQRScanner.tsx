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
  title?: string;
};

export function StampQRScanner({ onScan, onClose, isSameSlug, errorMessage, title }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState<"idle" | "reading">("idle");
  const readerRef = useRef<Html5Qrcode | null>(null);
  const claimedRef = useRef(false);
  const containerId = "stamp-qr-reader";

  useEffect(() => {
    let mounted = true;
    setError(null);
    setScanning(true);
    claimedRef.current = false;

    Html5Qrcode.getCameras()
      .then((cameras) => {
        if (!mounted) return;
        if (!cameras?.length) {
          setError("No se ha detectado ninguna cámara. Comprueba los permisos de la app o usa otro dispositivo.");
          setScanning(false);
          return;
        }
        const html5Qr = new Html5Qrcode(containerId);
        readerRef.current = html5Qr;
        return html5Qr.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: (vW, vH) => {
              const size = Math.min(280, Math.min(vW, vH) - 20);
              return { width: size, height: size };
            },
            aspectRatio: 1,
          },
          (decodedText) => {
            if (!mounted || claimedRef.current) return;
            const parsed = parseClaimStampUrl(decodedText);
            if (!parsed) return;
            if (!isSameSlug(parsed.slug)) {
              setError("Este QR es de otro establecimiento. Escanea el QR de este local para añadir el sello.");
              return;
            }
            claimedRef.current = true;
            setStatus("reading");
            html5Qr.stop().catch(() => {});
            readerRef.current = null;
            onScan(parsed.token);
          },
          () => {}
        );
      })
      .catch((e) => {
        if (mounted) {
          setError(e?.message || "No se pudo acceder a la cámara. Comprueba que hayas dado permiso a la cámara en el navegador.");
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
        <span style={{ color: "#fff", fontSize: 16 }}>{title ?? "Escanea el QR del establecimiento"}</span>
        <Button variant="secondary" onClick={onClose}>Cerrar</Button>
      </div>
      {(error || errorMessage) && (
        <p style={{ color: "#f87171", fontSize: 14, marginBottom: 8 }}>{error || errorMessage}</p>
      )}
      <div id={containerId} style={{ width: "100%", maxWidth: 320, flex: 1, minHeight: 280 }} />
      {status === "reading" && <p style={{ color: "#86efac", fontSize: 14, marginTop: 8 }}>Añadiendo sello…</p>}
      {!scanning && !error && status !== "reading" && <p style={{ color: "#888", fontSize: 13 }}>Apunta al QR del local.</p>}
    </div>
  );
}

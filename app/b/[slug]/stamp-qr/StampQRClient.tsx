"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function StampQRClient({ claimUrl }: { claimUrl: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(claimUrl, { width: 280, margin: 2 }).then(setDataUrl);
  }, [claimUrl]);

  if (!dataUrl) return <div style={{ height: 284, display: "flex", alignItems: "center", justifyContent: "center" }}>Generando QR…</div>;

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <img src={dataUrl} alt="QR para añadir sello" width={280} height={280} style={{ display: "block" }} />
    </div>
  );
}

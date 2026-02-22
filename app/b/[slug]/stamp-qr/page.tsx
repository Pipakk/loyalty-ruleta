import { createStampToken } from "@/lib/stampToken";
import { ConfigService } from "@/lib/config/ConfigService";
import { StampQRClient } from "./StampQRClient";

function getBaseUrl(): string {
  if (typeof process.env.NEXT_PUBLIC_APP_URL === "string" && process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://fidelidad-digital.vercel.app";
}

export default async function StampQRPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { business: bar, config: cfg } = await ConfigService.getConfig(slug);

  if (!bar) {
    return (
      <main style={{ padding: 24, textAlign: "center" }}>
        <p>Negocio no encontrado.</p>
      </main>
    );
  }

  const token = createStampToken(slug);
  const baseUrl = getBaseUrl();
  const claimUrl = `${baseUrl}/b/${slug}/claim-stamp?t=${encodeURIComponent(token)}`;

  return (
    <main style={{ padding: 24, maxWidth: 360, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{bar.name}</h1>
        <p style={{ fontSize: 14, color: "#666", marginTop: 4 }}>Escanea para añadir 1 sello</p>
      </div>
      <StampQRClient claimUrl={claimUrl} />
      <p style={{ fontSize: 12, color: "#888", textAlign: "center", marginTop: 16 }}>
        El cliente escanea este QR con la cámara o desde la opción «Escanea para añadir sello» en su wallet.
      </p>
    </main>
  );
}

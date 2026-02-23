"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { useBusinessConfig } from "@/lib/client/useBusinessConfig";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function ClaimStampPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("t");
  const slug = params.slug;

  const [status, setStatus] = useState<"loading" | "success" | "error" | "need_login">("loading");
  const [message, setMessage] = useState<string>("");
  const claimedOnceRef = useRef(false);
  const { data: cfgData } = useBusinessConfig(slug);
  const cfg = cfgData?.config;

  useEffect(() => {
    if (!token || !slug) {
      setStatus("error");
      setMessage("Falta el código del QR o la dirección es incorrecta. Escanea de nuevo el QR del establecimiento.");
      return;
    }
    if (claimedOnceRef.current) return;
    claimedOnceRef.current = true;

    (async () => {
      const supabase = supabaseBrowser();
      const { data: auth } = await supabase.auth.getUser();
      const customerId = auth.user?.id;

      if (!customerId) {
        setStatus("need_login");
        setMessage("Tienes que iniciar sesión con tu cuenta para que se añada el sello a tu wallet.");
        return;
      }

      const res = await fetch("/api/stamp/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, customerId }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setStatus("success");
        setMessage("¡Sello añadido!");
      } else {
        setStatus("error");
        setMessage(
          data.error === "invalid_token"
            ? "Este código QR no es válido o ha caducado. Usa el QR actual del establecimiento."
            : (data.error || "No se pudo añadir el sello. Inténtalo de nuevo más tarde.")
        );
      }
    })();
  }, [token, slug]);

  return (
    <main style={{ padding: 24, maxWidth: 400, margin: "0 auto" }}>
      <Card>
        <div style={{ textAlign: "center", padding: "24px 16px" }}>
          {status === "loading" && <p>{cfg?.texts?.common?.loading ?? "Cargando…"}</p>}
          {status === "success" && (
            <>
              <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>✓ {message}</p>
              <Button onClick={() => router.push(`/b/${slug}/wallet`)}>
                {cfg?.texts?.landing?.cta_wallet ?? "Ir a Mi wallet"}
              </Button>
            </>
          )}
          {status === "error" && (
            <>
              <p style={{ fontSize: 16, color: "#b91c1c", marginBottom: 16 }}>{message}</p>
              <Button variant="secondary" onClick={() => router.push(`/b/${slug}/wallet`)}>
                Volver al wallet
              </Button>
            </>
          )}
          {status === "need_login" && (
            <>
              <p style={{ marginBottom: 16 }}>{message}</p>
              <Button onClick={() => router.push(`/b/${slug}/login?redirect=/b/${slug}/claim-stamp?t=${encodeURIComponent(token || "")}`)}>
                Iniciar sesión
              </Button>
            </>
          )}
        </div>
      </Card>
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";

type Bar = {
  id: string;
  name: string;
  slug: string;
  stamp_goal: number;
  reward_title: string;
  wheel_enabled: boolean;
  logo_url?: string | null; // por si existe en tu tabla
};

export default function BarLanding() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [bar, setBar] = useState<Bar | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: barData, error } = await supabase
        .from("bars")
        .select("id,name,slug,stamp_goal,reward_title,wheel_enabled,logo_url")
        .eq("slug", slug)
        .single();

      if (error) {
        alert("No se encontró el bar. Revisa el slug en Supabase.");
        setLoading(false);
        return;
      }
      setBar(barData as Bar);

      const { data: auth } = await supabase.auth.getUser();
      setUserId(auth.user?.id ?? null);

      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#fff", background: "#0b1220" }}>
        Cargando...
      </main>
    );
  }
  if (!bar) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#fff", background: "#0b1220" }}>
        Bar no encontrado
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(1200px 600px at 20% 10%, rgba(255,186,73,.35), transparent 60%)," +
          "radial-gradient(900px 500px at 90% 20%, rgba(52,211,153,.30), transparent 55%)," +
          "radial-gradient(900px 500px at 30% 90%, rgba(248,113,113,.25), transparent 55%)," +
          "linear-gradient(180deg, #0b1220 0%, #0a0f1a 100%)",
        color: "#fff",
      }}
    >
      <div
        style={{
          width: "min(560px, 100%)",
          borderRadius: 20,
          padding: 18,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 18,
              overflow: "hidden",
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {bar.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bar.logo_url} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: 28 }}>🍻</span>
            )}
          </div>

          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 12, opacity: 0.8, letterSpacing: 0.4 }}>Bienvenido a</div>
            <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.15 }}>{bar.name}</div>
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>
              Acumula sellos y gana premios. Sin apps, solo QR.
            </div>
          </div>
        </div>

        {/* Info rápida */}
        <div
          style={{
            borderRadius: 16,
            padding: 14,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            display: "grid",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <span style={{ opacity: 0.85 }}>Objetivo de sellos</span>
            <strong>{bar.stamp_goal}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <span style={{ opacity: 0.85 }}>Premio por completar</span>
            <strong>{bar.reward_title}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <span style={{ opacity: 0.85 }}>Ruleta</span>
            <strong>{bar.wheel_enabled ? "Activada" : "No disponible"}</strong>
          </div>
        </div>

        {/* CTA */}
        {!userId ? (
          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            <button
              onClick={() => router.push(`/b/${slug}/login`)}
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 900,
                color: "#0b1220",
                background: "linear-gradient(90deg,#fde68a,#34d399)",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
                touchAction: "manipulation",
              }}
            >
              Empezar (crear cuenta / entrar)
            </button>

            <div style={{ fontSize: 12, opacity: 0.78, lineHeight: 1.35, textAlign: "center" }}>
              Inicia sesión para guardar tus sellos y premios.
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            <button
              onClick={() => router.push(`/b/${slug}/wallet`)}
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 900,
                color: "#0b1220",
                background: "linear-gradient(90deg,#fde68a,#34d399)",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
                touchAction: "manipulation",
              }}
            >
              Ver mis sellos
            </button>

            {bar.wheel_enabled && (
              <button
                onClick={() => router.push(`/b/${slug}/spin`)}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 800,
                  touchAction: "manipulation",
                }}
              >
                🎡 Girar ruleta
              </button>
            )}

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setUserId(null);
              }}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 14,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 800,
                opacity: 0.9,
              }}
            >
              Cerrar sesión
            </button>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 14, fontSize: 12, opacity: 0.75, textAlign: "center", lineHeight: 1.35 }}>
          Al continuar aceptas la política de privacidad del establecimiento.
          <br />
          Consejo: añade esta web a tu pantalla de inicio para abrirla como app.
        </div>
      </div>
    </main>
  );
}

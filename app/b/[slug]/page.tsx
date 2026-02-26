"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { useBusinessConfig } from "@/lib/client/useBusinessConfig";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/themes/ThemeContext";

export default function BarLanding() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [formLoading, setFormLoading] = useState(false);

  const { data: cfgData, loading: cfgLoading, error: configError } = useBusinessConfig(slug);
  const cfg = cfgData?.config;
  const business = cfgData?.business;

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      setUserId(auth.user?.id ?? null);
      setLoading(false);
    })();
  }, [supabase]);

  // Si ya está logueado, ir directo a la wallet (sin mostrar pestaña intermedia)
  useEffect(() => {
    if (!loading && !cfgLoading && userId && business) {
      router.replace(`/b/${slug}/wallet`);
    }
  }, [loading, cfgLoading, userId, business, slug, router]);

  const theme = useTheme();
  const c = theme.color;
  const t = theme.tokens;

  async function submit() {
    if (!email || !password) {
      alert(cfg?.texts?.login?.validation_missing ?? "Rellena email y contraseña");
      return;
    }
    if (password.length < 6) {
      alert(cfg?.texts?.login?.validation_password_len ?? "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setFormLoading(true);

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      setFormLoading(false);
      if (error) {
        const msg =
          error.message?.includes("already registered") || error.message?.includes("already been registered")
            ? "Este correo ya está registrado. Entra con tu contraseña."
            : error.message?.includes("Invalid login")
              ? "Email o contraseña incorrectos."
              : error.message || "No se pudo crear la cuenta.";
        alert(msg);
        return;
      }
      if (data.user?.id) {
        await supabase.from("customers").upsert({ id: data.user.id, phone: null });
      }
      router.push(`/b/${slug}/wallet`);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setFormLoading(false);
    if (error) {
      const msg =
        error.message?.includes("Invalid login") || error.message?.includes("invalid")
          ? "Email o contraseña incorrectos."
          : error.message || "No se pudo iniciar sesión.";
      alert(msg);
      return;
    }
    if (data.user?.id) {
      await supabase.from("customers").upsert({ id: data.user.id, phone: null });
    }
    setUserId(data.user?.id ?? null);
    router.push(`/b/${slug}/wallet`);
  }

  if (loading || cfgLoading || !cfg) {
    if (configError && !cfgLoading) {
      return (
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            background: c.background,
            color: c.text,
            fontFamily: t.font.sans,
            padding: 24,
          }}
        >
          <p style={{ fontSize: 16, color: c.text, textAlign: "center" }}>No encontramos este establecimiento.</p>
          <Button onClick={() => router.push("/")}>Volver al inicio</Button>
        </main>
      );
    }
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: c.background,
          color: c.text,
          fontFamily: t.font.sans,
        }}
      >
        <span style={{ fontSize: 15, color: c.secondary }}>Cargando…</span>
      </main>
    );
  }

  if (!business) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          background: c.background,
          color: c.text,
          fontFamily: t.font.sans,
          padding: 24,
        }}
      >
        <p style={{ fontSize: 16, color: c.text, textAlign: "center" }}>No encontramos este establecimiento.</p>
        <Button onClick={() => router.push("/")}>Volver al inicio</Button>
      </main>
    );
  }

  const name = cfg.branding?.name || business.name;
  const logoUrl = cfg.branding?.logo_url || business.logo_url;

  // Si ya está logueado, no mostrar nada (el useEffect redirige a wallet)
  if (userId) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: c.background,
          fontFamily: t.font.sans,
        }}
      >
        <span style={{ fontSize: 15, color: c.secondary }}>Cargando…</span>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: t.space.xl,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: c.background,
        color: c.text,
        fontFamily: t.font.sans,
      }}
    >
      <div style={{ width: "min(400px, 100%)", textAlign: "center" }}>
        <div
          style={{
            width: 88,
            height: 88,
            margin: "0 auto",
            borderRadius: t.radius,
            overflow: "hidden",
            border: `1px solid ${c.border}`,
            background: c.white,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: t.space.lg,
          }}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: 32, color: c.secondary }}>—</span>
          )}
        </div>

        <h1 style={{ fontSize: 24, fontWeight: t.font.weight.semibold, color: c.text, marginBottom: t.space.xs }}>
          {name}
        </h1>
        <p style={{ fontSize: 14, color: c.secondary, marginBottom: t.space.lg }}>
          {cfg.texts?.landing?.subtitle ?? "Programa de fidelización"}
        </p>

        <Card>
          <div
            style={{
              display: "flex",
              gap: t.space.xs,
              marginBottom: t.space.md,
              padding: 4,
              borderRadius: 10,
              background: c.background,
              border: `1px solid ${c.border}`,
            }}
          >
            <button
              type="button"
              onClick={() => setMode("signup")}
              style={{
                flex: 1,
                padding: t.space.sm,
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontWeight: t.font.weight.medium,
                background: mode === "signup" ? c.white : "transparent",
                color: mode === "signup" ? c.text : c.secondary,
                boxShadow: mode === "signup" ? `0 1px 3px ${c.shadow}` : "none",
              }}
            >
              Crear cuenta
            </button>
            <button
              type="button"
              onClick={() => setMode("login")}
              style={{
                flex: 1,
                padding: t.space.sm,
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontWeight: t.font.weight.medium,
                background: mode === "login" ? c.white : "transparent",
                color: mode === "login" ? c.text : c.secondary,
                boxShadow: mode === "login" ? `0 1px 3px ${c.shadow}` : "none",
              }}
            >
              Entrar
            </button>
          </div>

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            autoComplete="email"
          />
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />

          <div style={{ marginTop: t.space.md }}>
            <Button onClick={submit} disabled={formLoading}>
              {formLoading ? "Procesando…" : mode === "signup" ? "Crear cuenta" : "Entrar"}
            </Button>
          </div>
        </Card>

        <p style={{ marginTop: t.space.xl, fontSize: 11, color: c.secondary, lineHeight: 1.4 }}>
          {cfg.texts?.landing?.privacy_line_1}
          <br />
          {cfg.texts?.landing?.privacy_line_2}
        </p>
      </div>
    </main>
  );
}

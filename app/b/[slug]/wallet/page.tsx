"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { useBusinessConfig } from "@/lib/client/useBusinessConfig";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StampQRScanner } from "@/components/StampQRScanner";
import { useTheme } from "@/themes/ThemeContext";

type Membership = {
  id: string;
  bar_id: string;
  customer_id: string;
  stamps_count: number;
  updated_at: string;
};

type Reward = {
  id: string;
  title: string;
  source: string;
  status: string;
  expires_at: string;
  created_at: string;
};

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("es-ES");
  } catch {
    return d;
  }
}

function DefaultStampDot({ filled }: { filled: boolean }) {
  const theme = useTheme();
  const c = theme.color;
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: filled ? c.secondary : c.surface,
        border: `1px solid ${filled ? c.textSoft : c.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {filled ? (
        <span style={{ fontSize: 14 }} title="Sello">☕</span>
      ) : (
        <div style={{ width: 4, height: 4, borderRadius: "50%", background: c.secondary }} />
      )}
    </div>
  );
}

export default function WalletPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [customerId, setCustomerId] = useState<string | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rewardsRedeemed, setRewardsRedeemed] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const claimByQRInProgressRef = useRef(false);
  const [lastQRClaimAt, setLastQRClaimAt] = useState<number>(0);
  const [qrCooldownLeft, setQrCooldownLeft] = useState(0);
  const [redeemQRRewardId, setRedeemQRRewardId] = useState<string | null>(null);

  const { data: cfgData, loading: cfgLoading, error: configError } = useBusinessConfig(slug);
  const cfg = cfgData?.config;
  const business = cfgData?.business;

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id || null;
      setCustomerId(uid);

      if (!cfgData?.business || !cfg || !uid) {
        setLoading(false);
        return;
      }

      const { data: m } = await supabase
        .from("memberships")
        .select("id,bar_id,customer_id,stamps_count,updated_at")
        .eq("bar_id", cfgData.business.id)
        .eq("customer_id", uid)
        .maybeSingle();

      setMembership(
        (m as Membership) ?? {
          id: "tmp",
          bar_id: cfgData.business.id,
          customer_id: uid,
          stamps_count: 0,
          updated_at: new Date().toISOString(),
        }
      );

      const { data: rActive } = await supabase
        .from("rewards")
        .select("id,title,source,status,expires_at,created_at")
        .eq("bar_id", cfgData.business.id)
        .eq("customer_id", uid)
        .eq("status", "active")
        .order("expires_at", { ascending: true });

      const { data: rRedeemed } = await supabase
        .from("rewards")
        .select("id,title,source,status,expires_at,created_at")
        .eq("bar_id", cfgData.business.id)
        .eq("customer_id", uid)
        .eq("status", "redeemed")
        .order("created_at", { ascending: false });

      setRewards((rActive as Reward[]) || []);
      setRewardsRedeemed((rRedeemed as Reward[]) || []);
      setLoading(false);
    })();
  }, [slug, cfgData?.business?.id, cfg]);

  async function refresh() {
    if (!business || !customerId) return;

    const { data: m } = await supabase
      .from("memberships")
      .select("id,bar_id,customer_id,stamps_count,updated_at")
      .eq("bar_id", business.id)
      .eq("customer_id", customerId)
      .maybeSingle();

    setMembership(
      (m as Membership) ?? {
        id: "tmp",
        bar_id: business.id,
        customer_id: customerId,
        stamps_count: 0,
        updated_at: new Date().toISOString(),
      }
    );

    const { data: rActive } = await supabase
      .from("rewards")
      .select("id,title,source,status,expires_at,created_at")
      .eq("bar_id", business.id)
      .eq("customer_id", customerId)
      .eq("status", "active")
      .order("expires_at", { ascending: true });

    const { data: rRedeemed } = await supabase
      .from("rewards")
      .select("id,title,source,status,expires_at,created_at")
      .eq("bar_id", business.id)
      .eq("customer_id", customerId)
      .eq("status", "redeemed")
      .order("created_at", { ascending: false });

    setRewards((rActive as Reward[]) || []);
    setRewardsRedeemed((rRedeemed as Reward[]) || []);
  }

  async function claimStampByQR(token: string) {
    if (!customerId || !cfg) return;
    if (claimByQRInProgressRef.current) return;
    claimByQRInProgressRef.current = true;
    setShowQRScanner(false);
    setBusy(true);
    try {
      const res = await fetch("/api/stamp/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, customerId }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error === "invalid_token"
          ? "Este código QR no es válido o ha caducado. Usa el QR actual del establecimiento."
          : (data.error || "No se pudo añadir el sello. Inténtalo de nuevo.");
        alert(msg);
        return;
      }
      setLastQRClaimAt(Date.now());
      await refresh();
      if (data.createdReward) {
        alert(cfg?.texts?.wallet?.stamps_completed_message ?? "¡Objetivo completado! Tienes un nuevo premio para canjear.");
      }
    } finally {
      setBusy(false);
      claimByQRInProgressRef.current = false;
    }
  }

  async function redeemByQR(token: string, rewardId: string) {
    if (!customerId || !cfg) return;
    if (busy) return;
    setBusy(true);
    setRedeemQRRewardId(null);
    try {
      const res = await fetch("/api/redeem/by-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, customerId, rewardId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(
          data.error === "invalid_token"
            ? "Este código QR no es válido o ha caducado. Usa el QR del establecimiento."
            : (data.error || "No se pudo canjear el premio. Inténtalo de nuevo.")
        );
        return;
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (lastQRClaimAt <= 0) return;
    const COOLDOWN_SEC = 10;
    setQrCooldownLeft(COOLDOWN_SEC);
    const t = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastQRClaimAt) / 1000);
      const left = Math.max(0, COOLDOWN_SEC - elapsed);
      setQrCooldownLeft(left);
      if (left <= 0) clearInterval(t);
    }, 500);
    return () => clearInterval(t);
  }, [lastQRClaimAt]);

  const theme = useTheme();
  const StampComponent = theme.components?.Stamp ?? DefaultStampDot;
  const stampsGoal = cfg?.stamps?.goal ?? 8;
  const stamps = membership?.stamps_count ?? 0;
  const name = cfg?.branding?.name || business?.name || "Negocio";
  const logoUrl = cfg?.branding?.logo_url || business?.logo_url;
  const c = theme.color;
  const t = theme.tokens;

  if (!loading && !cfgLoading && !customerId) {
    router.replace(`/b/${slug}`);
    return null;
  }

  if (!cfgLoading && (configError || (cfgData && !cfgData.business))) {
    return (
      <main style={{ minHeight: "100vh", padding: 24, display: "flex", alignItems: "center", justifyContent: "center", background: c.background, fontFamily: t.font.sans }}>
        <div style={{ textAlign: "center", maxWidth: 360 }}>
          <p style={{ fontSize: 18, fontWeight: t.font.weight.medium, color: c.text, marginBottom: 8 }}>
            No encontramos este establecimiento
          </p>
          <Button onClick={() => router.push("/")}>Volver al inicio</Button>
        </div>
      </main>
    );
  }

  const qrScanDisabled = busy || !customerId || qrCooldownLeft > 0;

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: t.space.lg,
        background: c.background,
        color: c.text,
        fontFamily: t.font.sans,
      }}
    >
      <div style={{ maxWidth: 420, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: t.space.sm,
            marginBottom: t.space.lg,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: t.radius,
              overflow: "hidden",
              border: `1px solid ${c.border}`,
              background: c.white,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: 20, color: c.primary }}>—</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: t.font.weight.semibold, fontSize: 18 }}>{name}</div>
          </div>
          <Button
            variant="secondary"
            style={{ width: "auto", padding: "10px 14px" }}
            onClick={async () => {
              await supabase.auth.signOut();
              router.push(`/b/${slug}`);
            }}
          >
            Cerrar sesión
          </Button>
        </div>

        <Card style={{ marginBottom: t.space.lg }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: t.space.sm }}>
            <span style={{ fontSize: 15, fontWeight: t.font.weight.medium }}>
              {cfg?.texts?.wallet?.section_stamps ?? "Tus sellos"}
            </span>
            <span style={{ fontSize: 14, color: c.secondary }}>
              {stamps} de {stampsGoal}
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {Array.from({ length: stampsGoal }).map((_, i) => (
              <StampComponent key={i} filled={i < stamps} />
            ))}
          </div>
          <p style={{ marginTop: t.space.sm, fontSize: 13, color: c.secondary }}>
            Te faltan <strong>{Math.max(0, stampsGoal - stamps)}</strong> para completar.
          </p>
        </Card>

        <Card style={{ marginBottom: t.space.lg }}>
          <Button
            onClick={() => setShowQRScanner(true)}
            disabled={qrScanDisabled}
            style={{ width: "100%" }}
          >
            {qrCooldownLeft > 0
              ? `Espera ${qrCooldownLeft} s para escanear de nuevo`
              : "Escanear sello"}
          </Button>
          {showQRScanner && (
            <StampQRScanner
              isSameSlug={(s) => s === slug}
              onScan={(token) => claimStampByQR(token)}
              onClose={() => setShowQRScanner(false)}
            />
          )}
        </Card>

        <Card style={{ marginBottom: t.space.lg }}>
          <div style={{ fontSize: 15, fontWeight: t.font.weight.medium, marginBottom: t.space.sm }}>
            {cfg?.texts?.wallet?.rewards_title ?? "Premios activos"}
          </div>
          {loading ? (
            <p style={{ fontSize: 14, color: c.secondary }}>{cfg?.texts?.common?.loading ?? "Cargando…"}</p>
          ) : rewards.length === 0 ? (
            <p style={{ fontSize: 14, color: c.secondary }}>{cfg?.texts?.wallet?.rewards_empty ?? "Sin premios activos."}</p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: t.space.sm }}>
              {rewards.map((r) => (
                <li
                  key={r.id}
                  style={{
                    padding: t.space.md,
                    borderRadius: t.radius,
                    border: `1px solid ${c.border}`,
                    background: c.background,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: t.space.sm,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 10,
                      background: c.surface,
                      border: `1px solid ${c.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      flexShrink: 0,
                    }}
                  >
                    {theme.key === "barber" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src="/themes/barber/scissors.png" alt="" width={28} height={28} style={{ objectFit: "contain" }} />
                    ) : theme.key === "esthetic" ? (
                      "💅"
                    ) : (
                      "🍺"
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: t.font.weight.semibold, fontSize: 15, color: c.text }}>
                      1× {r.title}
                    </div>
                    <div style={{ fontSize: 13, color: c.ready ?? c.text, marginTop: 2 }}>
                      ✔ {cfg?.texts?.wallet?.rewards_ready ?? "Listo para usar"}
                    </div>
                    <div style={{ fontSize: 12, color: c.secondary, marginTop: 4 }}>
                      {cfg?.texts?.wallet?.rewards_expires_at ?? "Caduca:"} {formatDate(r.expires_at)}
                    </div>
                    <div style={{ marginTop: t.space.sm }}>
                      <Button
                        variant="secondary"
                        onClick={() => setRedeemQRRewardId(r.id)}
                        disabled={busy}
                      >
                        Escanear QR para canjear
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {redeemQRRewardId && (
            <StampQRScanner
              isSameSlug={(s) => s === slug}
              onScan={(token) => redeemByQR(token, redeemQRRewardId)}
              onClose={() => setRedeemQRRewardId(null)}
              title="Escanea el QR del establecimiento para canjear este premio"
            />
          )}
        </Card>

        {rewardsRedeemed.length > 0 && (
          <Card>
            <div style={{ fontSize: 15, fontWeight: t.font.weight.medium, marginBottom: t.space.sm }}>
              Premios canjeados
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: t.space.sm }}>
              {rewardsRedeemed.map((r) => (
                <li
                  key={r.id}
                  style={{
                    padding: t.space.md,
                    borderRadius: t.radius,
                    border: `1px solid ${c.border}`,
                    background: c.surface,
                    display: "flex",
                    alignItems: "center",
                    gap: t.space.sm,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: c.background,
                      border: `1px solid ${c.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: t.font.weight.medium, fontSize: 14, color: c.text }}>1× {r.title}</div>
                    <div style={{ fontSize: 12, color: c.secondary, marginTop: 2 }}>Canjeado</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </main>
  );
}

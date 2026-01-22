import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PRIZES = [
  "1 sello extra",
  "Sigue jugando",
  "5% dto próxima visita",
  "Sigue jugando",
  "Tapa gratis",
  "Sigue jugando",
];

function pickPrize() {
  const idx = Math.floor(Math.random() * PRIZES.length);
  return PRIZES[idx];
}

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { barSlug?: string; customerId?: string };
    const barSlug = body.barSlug;
    const customerId = body.customerId;

    if (!barSlug || !customerId) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const sb = supabaseAdmin();

    // 1) Bar
    const { data: bar, error: barErr } = await sb
      .from("bars")
      .select("id,stamp_goal,reward_expires_days,reward_title,wheel_enabled")
      .eq("slug", barSlug)
      .single();

    if (barErr || !bar) return NextResponse.json({ error: "Bar not found" }, { status: 404 });
    if (bar.wheel_enabled === false) return NextResponse.json({ error: "Wheel disabled" }, { status: 403 });

    // 2) Premio
    const prize = pickPrize();

    // 3) Registrar giro (opcional)
    //    OJO: si tu columna reward_id NO permite null, avísame y lo adaptamos.
    const spinId = cryptoRandomUUID();

    // 4) Caso: no gana nada
    if (prize === "Sigue jugando") {
      await sb.from("wheel_spins").insert({
        id: spinId,
        bar_id: bar.id,
        customer_id: customerId,
        reward_id: null,
      });
      return NextResponse.json({ prize, saved: false });
    }

    // 5) Caso: "1 sello extra" => sumar sello en memberships
    if (prize === "1 sello extra") {
      // asegurar membership
      const { data: membership, error: memErr } = await sb
        .from("memberships")
        .select("id,stamps_count")
        .eq("bar_id", bar.id)
        .eq("customer_id", customerId)
        .maybeSingle();

      if (memErr) return NextResponse.json({ error: memErr.message }, { status: 500 });

      if (!membership) {
        const { error: insMemErr } = await sb.from("memberships").insert({
          bar_id: bar.id,
          customer_id: customerId,
          stamps_count: 0,
        });
        if (insMemErr) return NextResponse.json({ error: insMemErr.message }, { status: 500 });
      }

      const current = membership?.stamps_count ?? 0;

      const { data: updated, error: updErr } = await sb
        .from("memberships")
        .update({ stamps_count: current + 1, updated_at: new Date().toISOString() })
        .eq("bar_id", bar.id)
        .eq("customer_id", customerId)
        .select("stamps_count")
        .single();

      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

      // registrar giro
      await sb.from("wheel_spins").insert({
        id: spinId,
        bar_id: bar.id,
        customer_id: customerId,
        reward_id: null,
      });

      return NextResponse.json({
        prize,
        saved: true,
        stampsAdded: 1,
        stamps: updated?.stamps_count ?? current + 1,
      });
    }

    // 6) Caso: premio normal => crear reward
    const expires = new Date();
    const days = Number(bar.reward_expires_days ?? 30);
    expires.setDate(expires.getDate() + (Number.isFinite(days) ? days : 30));

    const { data: reward, error: rErr } = await sb
      .from("rewards")
      .insert({
        bar_id: bar.id,
        customer_id: customerId,
        source: "wheel",
        title: prize,
        status: "active",
        expires_at: expires.toISOString(),
      })
      .select("id,title,source,status,expires_at")
      .single();

    if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 });

    await sb.from("wheel_spins").insert({
      id: spinId,
      bar_id: bar.id,
      customer_id: customerId,
      reward_id: reward.id,
    });

    return NextResponse.json({ prize, saved: true, reward });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

// Node 18+ tiene crypto.randomUUID en global en muchos entornos,
// pero lo dejo compatible por si acaso.
function cryptoRandomUUID() {
  // @ts-ignore
  return (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);
}

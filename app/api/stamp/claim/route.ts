import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/serverSupabase";
import { ConfigService } from "@/lib/config/ConfigService";
import { verifyStampToken } from "@/lib/stampToken";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { token?: string; customerId?: string };
    const { token, customerId } = body;

    if (!token || !customerId) {
      return NextResponse.json({ error: "Missing token or customerId" }, { status: 400 });
    }

    let slug: string;
    try {
      slug = verifyStampToken(token);
    } catch {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }

    const sb = supabaseServer();
    const { business: bar, config: cfg } = await ConfigService.getConfig(slug);
    if (!bar) {
      return NextResponse.json({ error: cfg?.texts?.api?.bar_not_found ?? "Bar not found" }, { status: 404 });
    }

    const { data: m0, error: m0Err } = await sb
      .from("memberships")
      .select("id,stamps_count")
      .eq("bar_id", bar.id)
      .eq("customer_id", customerId)
      .maybeSingle();

    if (m0Err) return NextResponse.json({ error: m0Err.message }, { status: 500 });
    const current = m0?.stamps_count ?? 0;

    if (!m0) {
      const { error: insErr } = await sb.from("memberships").insert({
        bar_id: bar.id,
        customer_id: customerId,
        stamps_count: 0,
      });
      if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    const { error: evErr } = await sb.from("stamp_events").insert({
      bar_id: bar.id,
      customer_id: customerId,
      staff_id: null,
    });
    if (evErr) return NextResponse.json({ error: evErr.message }, { status: 500 });

    const { data: updated, error: updErr } = await sb
      .from("memberships")
      .update({ stamps_count: current + 1, updated_at: new Date().toISOString() })
      .eq("bar_id", bar.id)
      .eq("customer_id", customerId)
      .select("stamps_count")
      .single();

    if (updErr || !updated) {
      return NextResponse.json({ error: updErr?.message ?? "Update failed" }, { status: 500 });
    }

    let createdReward: { id: string; title: string; expires_at?: string } | null = null;
    const goal = Number(cfg.stamps.goal ?? 0);
    if (goal > 0 && updated.stamps_count >= goal) {
      const expiresDays = Number(cfg.rewards.expires_days ?? 30);
      const expires = new Date();
      expires.setDate(expires.getDate() + (Number.isFinite(expiresDays) ? expiresDays : 30));
      const title = cfg.stamps.reward_title || bar.reward_title || "Premio por sellos";

      const { data: reward, error: rErr } = await sb
        .from("rewards")
        .insert({
          bar_id: bar.id,
          customer_id: customerId,
          source: "stamps",
          title,
          status: "active",
          expires_at: expires.toISOString(),
        })
        .select("id,title,expires_at")
        .single();

      if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 });
      createdReward = reward;

      const { error: resetErr } = await sb
        .from("memberships")
        .update({ stamps_count: 0, updated_at: new Date().toISOString() })
        .eq("bar_id", bar.id)
        .eq("customer_id", customerId);
      if (resetErr) return NextResponse.json({ error: resetErr.message }, { status: 500 });
    }

    const finalStamps = createdReward ? 0 : updated.stamps_count;
    return NextResponse.json({
      ok: true,
      stamps: finalStamps,
      createdReward: createdReward ?? undefined,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

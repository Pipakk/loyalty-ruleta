import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/serverSupabase";
import { ConfigService } from "@/lib/config/ConfigService";
import { verifyStampToken } from "@/lib/stampToken";

/**
 * Canjear un premio escaneando el mismo QR de los sellos. Body: token, customerId, rewardId.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { token?: string; customerId?: string; rewardId?: string };
    const { token, customerId, rewardId } = body;

    if (!token || !customerId || !rewardId) {
      return NextResponse.json({ error: "Faltan datos (token, usuario o premio)." }, { status: 400 });
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
      return NextResponse.json({ error: cfg?.texts?.api?.bar_not_found ?? "Establecimiento no encontrado" }, { status: 404 });
    }

    const { data: reward, error: rewardErr } = await sb
      .from("rewards")
      .select("id,bar_id,customer_id,status,title")
      .eq("id", rewardId)
      .eq("bar_id", bar.id)
      .single();

    if (rewardErr || !reward) {
      return NextResponse.json({ error: cfg?.texts?.api?.reward_not_found ?? "Premio no encontrado" }, { status: 404 });
    }
    if (reward.status !== "active") {
      return NextResponse.json({ error: cfg?.texts?.api?.reward_not_active ?? "Este premio ya no está disponible" }, { status: 409 });
    }
    if (reward.customer_id !== customerId) {
      return NextResponse.json({ error: cfg?.texts?.api?.reward_wrong_user ?? "Este premio no te corresponde" }, { status: 403 });
    }

    const { error: updErr } = await sb.from("rewards").update({ status: "redeemed" }).eq("id", rewardId);
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, title: reward.title });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error en el servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

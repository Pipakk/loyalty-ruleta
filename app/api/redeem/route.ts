import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function sha256(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
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
    const body = (await req.json()) as {
      rewardId?: string;
      barSlug?: string;
      pin?: string;
      staffPin?: string;
      customerId?: string;
    };

    const rewardId = body.rewardId;
    const barSlug = body.barSlug;
    const staffPin = body.staffPin || body.pin;

    if (!rewardId || !barSlug || !staffPin) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const sb = supabaseAdmin();

    const { data: bar, error: barErr } = await sb.from("bars").select("id").eq("slug", barSlug).single();
    if (barErr || !bar) return NextResponse.json({ error: "Bar not found" }, { status: 404 });

    const pinHash = sha256(staffPin);
    const { data: staff, error: staffErr } = await sb
      .from("staff_users")
      .select("id")
      .eq("bar_id", bar.id)
      .eq("pin_hash", pinHash)
      .maybeSingle();

    if (staffErr) return NextResponse.json({ error: staffErr.message }, { status: 500 });
    if (!staff) return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });

    const { data: reward, error: rewardErr } = await sb
      .from("rewards")
      .select("id,bar_id,customer_id,status")
      .eq("id", rewardId)
      .eq("bar_id", bar.id)
      .single();

    if (rewardErr || !reward) return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    if (reward.status !== "active") return NextResponse.json({ error: "Reward not active" }, { status: 409 });

    if (body.customerId && reward.customer_id !== body.customerId) {
      return NextResponse.json({ error: "Reward does not belong to this user" }, { status: 403 });
    }

    const { error: updErr } = await sb.from("rewards").update({ status: "redeemed" }).eq("id", rewardId);
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

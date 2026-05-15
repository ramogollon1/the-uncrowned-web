import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "100"), 200);
  const weapon = searchParams.get("weapon");

  let query = supabase
    .from("runs")
    .select("id, player_uuid, username, score, kills, elapsed_sec, total_damage, weapon_id, enchantment, player_level, created_at")
    .order("score", { ascending: false })
    .limit(limit);

  if (weapon && weapon !== "all") {
    query = query.eq("weapon_id", weapon);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  const entries = (data ?? []).map((row, i) => ({ rank: i + 1, ...row }));

  return NextResponse.json({ entries });
}

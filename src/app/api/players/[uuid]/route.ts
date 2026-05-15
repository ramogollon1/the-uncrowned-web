import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;

  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("player_uuid, username, created_at")
    .eq("player_uuid", uuid)
    .single();

  if (playerError || !player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  const { data: runs, error: runsError } = await supabase
    .from("runs")
    .select("*")
    .eq("player_uuid", uuid)
    .order("created_at", { ascending: false })
    .limit(20);

  if (runsError) {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  const allRuns = runs ?? [];
  const total_runs = allRuns.length;
  const best_score = allRuns.reduce((max, r) => Math.max(max, r.score), 0);
  const best_kills = allRuns.reduce((max, r) => Math.max(max, r.kills), 0);
  const total_kills = allRuns.reduce((sum, r) => sum + r.kills, 0);

  const weaponCount: Record<string, number> = {};
  const enchantCount: Record<string, number> = {};
  for (const r of allRuns) {
    weaponCount[r.weapon_id] = (weaponCount[r.weapon_id] ?? 0) + 1;
    if (r.enchantment) enchantCount[r.enchantment] = (enchantCount[r.enchantment] ?? 0) + 1;
  }

  const favorite_weapon = Object.entries(weaponCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "sword_default";
  const favorite_enchantment = Object.entries(enchantCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return NextResponse.json({
    player_uuid: player.player_uuid,
    username: player.username,
    total_runs,
    best_score,
    best_kills,
    total_kills,
    favorite_weapon,
    favorite_enchantment,
    recent_runs: allRuns,
  });
}

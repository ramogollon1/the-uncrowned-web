import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: runs, error } = await supabase
    .from("runs")
    .select("kills, elapsed_sec, score, weapon_id, enchantment");

  if (error) {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  const allRuns = runs ?? [];
  const total_runs = allRuns.length;
  const total_kills = allRuns.reduce((sum, r) => sum + r.kills, 0);
  const longest_run_sec = allRuns.reduce((max, r) => Math.max(max, r.elapsed_sec), 0);
  const avg_score = total_runs > 0 ? Math.round(allRuns.reduce((sum, r) => sum + r.score, 0) / total_runs) : 0;

  const weapon_distribution: Record<string, number> = {};
  const enchantment_distribution: Record<string, number> = {};
  for (const r of allRuns) {
    weapon_distribution[r.weapon_id] = (weapon_distribution[r.weapon_id] ?? 0) + 1;
    if (r.enchantment) {
      enchantment_distribution[r.enchantment] = (enchantment_distribution[r.enchantment] ?? 0) + 1;
    }
  }

  return NextResponse.json({
    total_runs,
    total_kills,
    longest_run_sec,
    avg_score,
    weapon_distribution,
    enchantment_distribution,
  }, {
    headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" },
  });
}

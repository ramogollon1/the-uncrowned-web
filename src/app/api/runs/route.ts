import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { calculateScore } from "@/lib/score";
import type { SubmitRunPayload } from "@/lib/types";

// Rate limit en memoria: máx 10 runs por IP en 60 segundos
const _ipWindows = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 10;
const WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = _ipWindows.get(ip);
  if (!entry || now > entry.reset) {
    _ipWindows.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  let body: SubmitRunPayload;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { player_uuid, username, kills, elapsed_sec, total_damage, damage_by_source, weapon_id, enchantment, player_level, character_id } = body;

  if (!player_uuid || !username || kills == null || elapsed_sec == null || total_damage == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (typeof player_uuid !== "string" || player_uuid.length > 64) {
    return NextResponse.json({ error: "Invalid player_uuid" }, { status: 400 });
  }

  if (typeof username !== "string" || username.length < 1 || username.length > 30) {
    return NextResponse.json({ error: "Invalid username" }, { status: 400 });
  }

  const score = calculateScore(kills, elapsed_sec, total_damage);

  // Upsert player
  const { error: playerError } = await supabase
    .from("players")
    .upsert({ player_uuid, username, updated_at: new Date().toISOString() }, { onConflict: "player_uuid" });

  if (playerError) {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  // Insert run
  const { error: runError } = await supabase.from("runs").insert({
    player_uuid,
    username,
    score,
    kills,
    elapsed_sec,
    total_damage,
    damage_by_source: damage_by_source ?? {},
    weapon_id: weapon_id ?? "sword_default",
    enchantment: enchantment ?? null,
    player_level: player_level ?? 1,
    character_id: character_id ?? "swordmaster",
  });

  if (runError) {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  // Calcular rank
  const { count } = await supabase
    .from("runs")
    .select("*", { count: "exact", head: true })
    .gt("score", score);

  const rank = (count ?? 0) + 1;

  return NextResponse.json({ ok: true, score, rank });
}

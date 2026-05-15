import { supabase } from "@/lib/supabase";
import { formatTime, formatNumber, formatWeapon } from "@/lib/format";
import { notFound } from "next/navigation";
import Link from "next/link";
import StatCard from "@/components/StatCard";
import type { Run } from "@/lib/types";

async function getPlayer(uuid: string) {
  const { data: player } = await supabase
    .from("players")
    .select("player_uuid, username, created_at")
    .eq("player_uuid", uuid)
    .single();

  if (!player) return null;

  const { data: runs } = await supabase
    .from("runs")
    .select("*")
    .eq("player_uuid", uuid)
    .order("created_at", { ascending: false })
    .limit(20);

  const allRuns: Run[] = runs ?? [];
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

  return { ...player, total_runs, best_score, best_kills, total_kills, favorite_weapon, favorite_enchantment, recent_runs: allRuns };
}

export default async function PlayerPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  const profile = await getPlayer(uuid);

  if (!profile) notFound();

  return (
    <div>
      {/* Back */}
      <Link
        href="/"
        style={{ fontFamily: "'Cinzel', serif", fontSize: "12px", letterSpacing: "2px", color: "var(--text-dim)", textDecoration: "none" }}
      >
        ← LEADERBOARD
      </Link>

      {/* Header */}
      <div className="mt-6 mb-8">
        <h1
          style={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 900,
            fontSize: "28px",
            letterSpacing: "4px",
            color: "var(--accent)",
            marginBottom: "4px",
          }}
        >
          {profile.username}
        </h1>
        <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "9px", color: "var(--text-dim)" }}>
          {profile.total_runs} {profile.total_runs === 1 ? "RUN" : "RUNS"}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 mb-4" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        <StatCard label="Mejor Score" value={formatNumber(profile.best_score)} mono />
        <StatCard label="Total Kills" value={formatNumber(profile.total_kills)} mono />
        <StatCard label="Mejor Kill Run" value={formatNumber(profile.best_kills)} mono />
        <StatCard label="Arma Favorita" value={formatWeapon(profile.favorite_weapon)} />
      </div>
      {profile.favorite_enchantment && (
        <div className="mb-8" style={{ maxWidth: "280px" }}>
          <StatCard label="Encantamiento Favorito" value={profile.favorite_enchantment} />
        </div>
      )}

      {/* Historial */}
      <h2
        style={{
          fontFamily: "'Cinzel', serif",
          fontWeight: 700,
          fontSize: "16px",
          letterSpacing: "3px",
          color: "var(--text-muted)",
          marginBottom: "16px",
          marginTop: "32px",
        }}
      >
        ÚLTIMAS RUNS
      </h2>

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Score", "Kills", "Tiempo", "Nivel", "Arma", "Encantamiento", "Fecha"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontFamily: "'Cinzel', serif",
                    fontSize: "11px",
                    letterSpacing: "2px",
                    color: "var(--text-dim)",
                    fontWeight: 600,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {profile.recent_runs.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "48px", textAlign: "center", color: "var(--text-dim)", fontFamily: "'Press Start 2P', monospace", fontSize: "11px" }}>
                  SIN RUNS
                </td>
              </tr>
            )}
            {profile.recent_runs.map((r, i) => (
              <tr
                key={r.id}
                style={{
                  borderBottom: i < profile.recent_runs.length - 1 ? "1px solid rgba(58,80,128,0.4)" : "none",
                  background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                }}
              >
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "11px", color: "var(--accent)" }}>
                    {formatNumber(r.score)}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "11px", color: "var(--text-muted)" }}>
                    {formatNumber(r.kills)}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "11px", color: "var(--text-muted)" }}>
                    {formatTime(r.elapsed_sec)}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "11px", color: "var(--text-muted)" }}>
                    {r.player_level}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: "var(--text-muted)" }}>
                    {formatWeapon(r.weapon_id)}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: "12px", color: r.enchantment ? "var(--text-muted)" : "var(--text-dim)" }}>
                    {r.enchantment ?? "—"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", color: "var(--text-dim)" }}>
                    {new Date(r.created_at).toLocaleDateString("es")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

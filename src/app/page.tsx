import { supabase } from "@/lib/supabase";
import { formatTime, formatNumber, formatWeapon } from "@/lib/format";
import Link from "next/link";
import type { LeaderboardEntry } from "@/lib/types";

const WEAPONS = [
  { id: "all", label: "Todas" },
  { id: "sword_default", label: "Espada" },
  { id: "staff_fire", label: "Bastón" },
  { id: "axe_throwing", label: "Hacha" },
];

async function getLeaderboard(weapon?: string): Promise<LeaderboardEntry[]> {
  let query = supabase
    .from("runs")
    .select("id, player_uuid, username, score, kills, elapsed_sec, total_damage, weapon_id, enchantment, player_level, created_at")
    .order("score", { ascending: false })
    .limit(100);

  if (weapon && weapon !== "all") {
    query = query.eq("weapon_id", weapon);
  }

  const { data } = await query;
  return (data ?? []).map((row, i) => ({ rank: i + 1, ...row })) as LeaderboardEntry[];
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ weapon?: string }>;
}) {
  const { weapon = "all" } = await searchParams;
  const entries = await getLeaderboard(weapon);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1
          style={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 900,
            fontSize: "32px",
            letterSpacing: "4px",
            color: "var(--accent)",
            marginBottom: "8px",
          }}
        >
          LEADERBOARD
        </h1>
        <p style={{ color: "var(--text-muted)", fontFamily: "'Cinzel', serif", fontSize: "13px", letterSpacing: "1px" }}>
          Top runs globales — score más alto
        </p>
      </div>

      {/* Filtro por arma */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {WEAPONS.map((w) => (
          <Link
            key={w.id}
            href={`/?weapon=${w.id}`}
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "12px",
              letterSpacing: "2px",
              padding: "8px 16px",
              borderRadius: "6px",
              border: `1px solid ${weapon === w.id ? "var(--accent)" : "var(--border)"}`,
              background: weapon === w.id ? "var(--surface)" : "transparent",
              color: weapon === w.id ? "var(--accent)" : "var(--text-muted)",
              textDecoration: "none",
              transition: "all 0.15s",
            }}
          >
            {w.label}
          </Link>
        ))}
      </div>

      {/* Tabla */}
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
              {["#", "Jugador", "Score", "Kills", "Tiempo", "Arma", "Encantamiento", "Nivel"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "12px 16px",
                    textAlign: h === "#" || h === "Score" || h === "Kills" || h === "Nivel" ? "center" : "left",
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
            {entries.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: "48px", textAlign: "center", color: "var(--text-dim)", fontFamily: "'Press Start 2P', monospace", fontSize: "11px" }}>
                  SIN RUNS AÚN
                </td>
              </tr>
            )}
            {entries.map((e, i) => (
              <tr
                key={e.id}
                style={{
                  borderBottom: i < entries.length - 1 ? "1px solid rgba(58,80,128,0.4)" : "none",
                  background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                }}
              >
                {/* Rank */}
                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                  <span
                    style={{
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: "12px",
                      color: e.rank <= 3 ? "var(--gold)" : "var(--text-dim)",
                      fontWeight: e.rank <= 3 ? 700 : 400,
                    }}
                  >
                    {e.rank <= 3 ? ["👑", "②", "③"][e.rank - 1] : e.rank}
                  </span>
                </td>

                {/* Jugador */}
                <td style={{ padding: "12px 16px" }}>
                  <Link
                    href={`/players/${e.player_uuid}`}
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: "14px",
                      color: "var(--accent)",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    {e.username}
                  </Link>
                </td>

                {/* Score */}
                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "12px", color: "var(--text)" }}>
                    {formatNumber(e.score)}
                  </span>
                </td>

                {/* Kills */}
                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "11px", color: "var(--text-muted)" }}>
                    {formatNumber(e.kills)}
                  </span>
                </td>

                {/* Tiempo */}
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "11px", color: "var(--text-muted)" }}>
                    {formatTime(e.elapsed_sec)}
                  </span>
                </td>

                {/* Arma */}
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: "var(--text-muted)" }}>
                    {formatWeapon(e.weapon_id)}
                  </span>
                </td>

                {/* Encantamiento */}
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: "12px", color: e.enchantment ? "var(--text-muted)" : "var(--text-dim)" }}>
                    {e.enchantment ?? "—"}
                  </span>
                </td>

                {/* Nivel */}
                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                  <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "11px", color: "var(--text-muted)" }}>
                    {e.player_level}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: "16px", color: "var(--text-dim)", fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "1px" }}>
        {entries.length} runs mostradas
      </p>
    </div>
  );
}

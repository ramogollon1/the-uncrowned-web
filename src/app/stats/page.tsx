import { supabase } from "@/lib/supabase";
import { formatTime, formatNumber, formatWeapon } from "@/lib/format";
import StatCard from "@/components/StatCard";

async function getStats() {
  const { data: runs } = await supabase
    .from("runs")
    .select("kills, elapsed_sec, score, weapon_id, enchantment");

  const allRuns = runs ?? [];
  const total_runs = allRuns.length;
  const total_kills = allRuns.reduce((sum, r) => sum + r.kills, 0);
  const longest_run_sec = allRuns.reduce((max, r) => Math.max(max, r.elapsed_sec), 0);
  const avg_score = total_runs > 0 ? Math.round(allRuns.reduce((sum, r) => sum + r.score, 0) / total_runs) : 0;

  const weapon_distribution: Record<string, number> = {};
  const enchantment_distribution: Record<string, number> = {};
  for (const r of allRuns) {
    weapon_distribution[r.weapon_id] = (weapon_distribution[r.weapon_id] ?? 0) + 1;
    if (r.enchantment) enchantment_distribution[r.enchantment] = (enchantment_distribution[r.enchantment] ?? 0) + 1;
  }

  return { total_runs, total_kills, longest_run_sec, avg_score, weapon_distribution, enchantment_distribution };
}

function DistributionBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ marginBottom: "12px" }}>
      <div className="flex justify-between mb-1">
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: "13px", color: "var(--text-muted)" }}>{label}</span>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "10px", color: "var(--accent)" }}>{pct}%</span>
      </div>
      <div style={{ background: "var(--bg)", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "var(--accent)",
            borderRadius: "4px",
            transition: "width 0.3s",
          }}
        />
      </div>
    </div>
  );
}

export default async function StatsPage() {
  const stats = await getStats();

  const weaponEntries = Object.entries(stats.weapon_distribution).sort((a, b) => b[1] - a[1]);
  const enchantEntries = Object.entries(stats.enchantment_distribution).sort((a, b) => b[1] - a[1]);

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
          STATS GLOBALES
        </h1>
        <p style={{ color: "var(--text-muted)", fontFamily: "'Cinzel', serif", fontSize: "13px", letterSpacing: "1px" }}>
          Totales de todos los jugadores
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 mb-10" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <StatCard label="Total Runs" value={formatNumber(stats.total_runs)} mono />
        <StatCard label="Total Kills" value={formatNumber(stats.total_kills)} mono />
        <StatCard label="Run Más Larga" value={formatTime(stats.longest_run_sec)} mono />
        <StatCard label="Score Promedio" value={formatNumber(stats.avg_score)} mono />
      </div>

      {/* Distribuciones */}
      <div className="grid gap-8" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* Armas */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "24px",
          }}
        >
          <h2
            style={{
              fontFamily: "'Cinzel', serif",
              fontWeight: 700,
              fontSize: "14px",
              letterSpacing: "3px",
              color: "var(--text-muted)",
              marginBottom: "20px",
            }}
          >
            ARMAS MÁS USADAS
          </h2>
          {weaponEntries.length === 0 && (
            <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "10px", color: "var(--text-dim)" }}>SIN DATOS</p>
          )}
          {weaponEntries.map(([id, count]) => (
            <DistributionBar key={id} label={formatWeapon(id)} count={count} total={stats.total_runs} />
          ))}
        </div>

        {/* Encantamientos */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "24px",
          }}
        >
          <h2
            style={{
              fontFamily: "'Cinzel', serif",
              fontWeight: 700,
              fontSize: "14px",
              letterSpacing: "3px",
              color: "var(--text-muted)",
              marginBottom: "20px",
            }}
          >
            ENCANTAMIENTOS MÁS USADOS
          </h2>
          {enchantEntries.length === 0 && (
            <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "10px", color: "var(--text-dim)" }}>SIN DATOS</p>
          )}
          {enchantEntries.map(([name, count]) => (
            <DistributionBar key={name} label={name} count={count} total={stats.total_runs} />
          ))}
        </div>
      </div>
    </div>
  );
}

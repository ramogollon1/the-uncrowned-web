interface StatCardProps {
  label: string;
  value: string | number;
  mono?: boolean;
}

export default function StatCard({ label, value, mono = false }: StatCardProps) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "20px 24px",
      }}
    >
      <div
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: "11px",
          letterSpacing: "2px",
          color: "var(--text-dim)",
          marginBottom: "8px",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: mono ? "'Press Start 2P', monospace" : "'Cinzel', serif",
          fontSize: mono ? "18px" : "24px",
          fontWeight: 700,
          color: "var(--accent)",
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
    </div>
  );
}

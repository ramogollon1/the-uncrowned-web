"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Leaderboard" },
  { href: "/stats", label: "Stats" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link
          href="/"
          style={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 900,
            fontSize: "18px",
            color: "var(--accent)",
            letterSpacing: "3px",
            textDecoration: "none",
          }}
        >
          THE UNCROWNED
        </Link>

        <div className="flex gap-6">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: "13px",
                  letterSpacing: "2px",
                  color: active ? "var(--accent)" : "var(--text-muted)",
                  textDecoration: "none",
                  borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                  paddingBottom: "2px",
                  transition: "color 0.15s",
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

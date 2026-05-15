import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "The Uncrowned — Leaderboard",
  description: "Estadísticas globales y leaderboard de The Uncrowned",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Nav />
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        <footer className="text-center py-6 mt-12" style={{ color: "var(--text-dim)", fontFamily: "'Press Start 2P', monospace", fontSize: "10px" }}>
          THE UNCROWNED © 2026
        </footer>
      </body>
    </html>
  );
}

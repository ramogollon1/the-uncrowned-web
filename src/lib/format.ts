export function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("es");
}

const WEAPON_LABELS: Record<string, string> = {
  sword_default: "Espada",
  staff_fire: "Bastón",
  axe_throwing: "Hacha",
};

export function formatWeapon(id: string): string {
  return WEAPON_LABELS[id] ?? id;
}

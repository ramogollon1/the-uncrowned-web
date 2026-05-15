export function calculateScore(kills: number, elapsed_sec: number, total_damage: number): number {
  return kills * 100 + Math.floor(elapsed_sec / 60) * 500 + Math.floor(total_damage / 1000) * 10;
}

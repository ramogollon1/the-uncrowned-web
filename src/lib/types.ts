export interface Player {
  id: string;
  player_uuid: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface Run {
  id: string;
  player_uuid: string;
  username: string;
  score: number;
  kills: number;
  elapsed_sec: number;
  total_damage: number;
  damage_by_source: Record<string, number>;
  weapon_id: string;
  enchantment: string | null;
  player_level: number;
  character_id: string;
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  player_uuid: string;
  username: string;
  score: number;
  kills: number;
  elapsed_sec: number;
  total_damage: number;
  weapon_id: string;
  enchantment: string | null;
  player_level: number;
  created_at: string;
}

export interface PlayerProfile {
  player_uuid: string;
  username: string;
  total_runs: number;
  best_score: number;
  best_kills: number;
  total_kills: number;
  favorite_weapon: string;
  favorite_enchantment: string | null;
  recent_runs: Run[];
}

export interface GlobalStats {
  total_runs: number;
  total_kills: number;
  longest_run_sec: number;
  avg_score: number;
  weapon_distribution: Record<string, number>;
  enchantment_distribution: Record<string, number>;
}

export interface SubmitRunPayload {
  player_uuid: string;
  username: string;
  kills: number;
  elapsed_sec: number;
  total_damage: number;
  damage_by_source: Record<string, number>;
  weapon_id: string;
  enchantment: string | null;
  player_level: number;
  character_id: string;
}

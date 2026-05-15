-- ============================================================
-- The Uncrowned — schema inicial
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Tabla de jugadores
create table if not exists players (
  id           uuid primary key default gen_random_uuid(),
  player_uuid  text unique not null,
  username     text not null,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Tabla de runs
create table if not exists runs (
  id                uuid primary key default gen_random_uuid(),
  player_uuid       text not null references players(player_uuid) on delete cascade,
  username          text not null,
  score             integer not null default 0,
  kills             integer not null default 0,
  elapsed_sec       float not null default 0,
  total_damage      integer not null default 0,
  damage_by_source  jsonb not null default '{}',
  weapon_id         text not null default 'sword_default',
  enchantment       text,
  player_level      integer not null default 1,
  character_id      text not null default 'swordmaster',
  created_at        timestamptz default now()
);

-- Índices
create index if not exists runs_score_idx on runs(score desc);
create index if not exists runs_player_uuid_idx on runs(player_uuid);
create index if not exists runs_weapon_id_idx on runs(weapon_id);
create index if not exists runs_created_at_idx on runs(created_at desc);

-- Trigger para actualizar updated_at en players
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger players_updated_at
  before update on players
  for each row execute function update_updated_at();

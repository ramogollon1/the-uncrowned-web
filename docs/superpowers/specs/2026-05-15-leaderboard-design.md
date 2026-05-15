# The Uncrowned — Web Stats & Leaderboard

## Objetivo
Web pública que muestra estadísticas globales del juego, leaderboard de runs y perfil por jugador. El juego (Godot) envía los datos al finalizar cada run vía HTTP POST.

---

## Stack
- **Framework**: Next.js 15 (App Router)
- **DB**: Supabase (PostgreSQL)
- **Deploy**: Vercel
- **Styling**: Tailwind CSS v4

## Visual / Temática
Extraída del juego directamente (`main_menu.tscn`):
- **Fondo**: `#0F1220` (negro azulado)
- **Surface/cards**: `#1A2948` con borde `#6699F2`
- **Texto principal**: `#FFFFFF`
- **Texto secundario**: `#C0C7E6` (gris azulado)
- **Acento**: `#74CFFF` (azul cielo brillante)
- **Fuentes**: Cinzel (títulos/labels) + Press Start 2P (números/stats) — ambas desde Google Fonts

---

## Identidad del jugador
- Al iniciar la primera run, Godot pide un **username** (string corto, 3-20 chars).
- Se persiste en `user://player_profile.cfg`.
- Se genera un **UUID v4** local también persistido en `user://player_profile.cfg`.
- Cada run se envía con `{ username, player_uuid, ...run_data }`.
- El leaderboard agrupa por `player_uuid`; muestra `username`.

---

## Fórmula de score
```
score = kills × 100 + floor(elapsed_sec / 60) × 500 + floor(total_damage / 1000) × 10
```
- Kills pesan más (habilidad directa)
- Tiempo sobrevivido es el segundo factor
- Daño total es el tercer factor (diferenciador de builds)

---

## Schema de DB (Supabase)

### tabla `players`
| columna | tipo | notas |
|---------|------|-------|
| `id` | uuid PK | generado por Supabase |
| `player_uuid` | text UNIQUE | UUID generado por Godot |
| `username` | text | último username usado |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### tabla `runs`
| columna | tipo | notas |
|---------|------|-------|
| `id` | uuid PK | |
| `player_uuid` | text FK → players.player_uuid | |
| `username` | text | snapshot del nombre en ese momento |
| `score` | integer | calculado en la API |
| `kills` | integer | |
| `elapsed_sec` | float | segundos totales de la run |
| `total_damage` | integer | suma de todas las fuentes |
| `damage_by_source` | jsonb | `{ sword: 1200, burn: 400, ... }` |
| `weapon_id` | text | sword_default / staff_fire / axe_throwing |
| `enchantment` | text | nombre del encantamiento o null |
| `player_level` | integer | nivel final del jugador |
| `character_id` | text | swordmaster / etc |
| `created_at` | timestamptz | |

---

## API Routes (Next.js)

### POST `/api/runs`
Recibe run desde Godot, calcula score, upsert player, inserta run.

**Body:**
```json
{
  "player_uuid": "uuid-v4",
  "username": "Nombre",
  "kills": 142,
  "elapsed_sec": 847.3,
  "total_damage": 48200,
  "damage_by_source": { "sword": 20000, "burn": 8000 },
  "weapon_id": "staff_fire",
  "enchantment": "Núcleo Infernal",
  "player_level": 34,
  "character_id": "swordmaster"
}
```

**Response:** `{ "ok": true, "score": 18420, "rank": 7 }`

### GET `/api/leaderboard?limit=100&weapon=all`
Devuelve top runs ordenados por score DESC. Filtro opcional por `weapon`.

### GET `/api/players/[player_uuid]`
Perfil del jugador: username, total runs, best score, best kills, total kills, arma favorita, encantamiento favorito, historial de runs (últimas 20).

### GET `/api/stats`
Stats globales: total runs, total kills globales, run más larga, arma más usada, encantamiento más usado, score promedio.

---

## Páginas web

### `/` — Leaderboard global
- Tabla: Rank, Jugador, Score, Kills, Tiempo, Arma, Encantamiento, Nivel
- Filtro por arma
- Click en jugador → perfil

### `/players/[player_uuid]` — Perfil
- Header: username, total runs, mejor score, total kills
- Stats: arma favorita, encantamiento favorito
- Tabla historial de últimas 20 runs

### `/stats` — Stats globales
- Total de runs jugadas
- Total de kills globales
- Run más larga
- Arma más popular (%)
- Encantamiento más popular (%)
- Score promedio

---

## Integración Godot

En `run_stats.gd`, al final de `end_run_and_freeze()` se llama `_submit_run()`:

```gdscript
func _submit_run() -> void:
    var http := HTTPRequest.new()
    add_child(http)
    var body := JSON.stringify({
        "player_uuid": PlayerProfile.uuid,
        "username": PlayerProfile.username,
        "kills": kills_total,
        "elapsed_sec": snapshot_sec,
        "total_damage": _get_total_damage(),
        "damage_by_source": _get_damage_by_source_dict(),
        "weapon_id": selected_weapon_id,
        "enchantment": final_enchantment_overview,
        "player_level": final_player_level,
        "character_id": selected_character_id,
    })
    http.request("https://the-uncrowned-web.vercel.app/api/runs",
        ["Content-Type: application/json"], HTTPClient.METHOD_POST, body)
```

Un autoload `PlayerProfile` persiste `uuid` y `username` en `user://player_profile.cfg`. Se muestra un diálogo de nombre la primera vez que se ejecuta el juego.

---

## Seguridad
- La API usa la **secret key** de Supabase solo en server-side (API Routes). Nunca expuesta al cliente.
- La publishable key se usa solo para queries de lectura desde el cliente si aplica.
- No hay autenticación de jugadores — el `player_uuid` es de confianza baja (suficiente para leaderboard casual).
- Rate limiting básico: Vercel limita por IP automáticamente en free tier.

---

## Variables de entorno
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

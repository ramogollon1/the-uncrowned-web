# The Uncrowned — Web Stats & Leaderboard

Web pública de estadísticas globales y leaderboard para [The Uncrowned](https://github.com/ramogollon1/the-uncrowned), un roguelite 2D side-scroller hecho en Godot 4.6.

## Features

- **Leaderboard global** — top runs ordenados por score, filtrable por arma
- **Perfil de jugador** — historial de runs, stats personales, arma y encantamiento favorito
- **Stats globales** — totales del juego: kills, runs, run más larga, armas más usadas

## Stack

- Next.js 15 (App Router)
- Supabase (PostgreSQL)
- Tailwind CSS v4
- Vercel (deploy)

## Setup local

```bash
git clone https://github.com/ramogollon1/the-uncrowned-web.git
cd the-uncrowned-web
npm install
cp .env.example .env.local
# completar .env.local con tus keys de Supabase
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `SUPABASE_URL` | URL de tu proyecto Supabase |
| `SUPABASE_SECRET_KEY` | Secret key (solo server-side) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública de Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key |

## Base de datos

Ejecutar la migración en Supabase SQL Editor:

```bash
supabase/migrations/001_init.sql
```

## Deploy en Vercel

1. Conectar este repo en [vercel.com](https://vercel.com)
2. Agregar las 4 variables de entorno en Settings → Environment Variables
3. Deploy automático en cada push a `main`

## API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/runs` | Recibe run finalizada desde Godot |
| `GET` | `/api/leaderboard` | Top runs por score |
| `GET` | `/api/players/[uuid]` | Perfil de jugador |
| `GET` | `/api/stats` | Stats globales |

## Score

```
score = kills × 100 + floor(minutos) × 500 + floor(daño/1000) × 10
```

## Integración con Godot

Ver `docs/godot-integration.gd` — snippet listo para pegar en el juego.

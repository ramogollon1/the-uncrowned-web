# The Uncrowned Web — Contexto del Proyecto

## Qué es esto
Web de estadísticas y leaderboard global para el videojuego **The Uncrowned** (roguelite 2D en Godot 4.6). El juego envía datos de cada run al finalizar vía HTTP POST. Esta web los muestra públicamente.

## Repo del juego
`https://github.com/ramogollon1/the-uncrowned` — repo separado. No mezclar.

## Stack
- **Next.js 15** (App Router, TypeScript)
- **Supabase** (PostgreSQL) — DB y autenticación futura
- **Tailwind CSS v4**
- **Vercel** — deploy

## Variables de entorno requeridas
```
SUPABASE_URL
SUPABASE_SECRET_KEY           # solo server-side (API Routes)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```
Ver `.env.example`. Nunca commitear `.env.local`.

## Estructura
```
src/
├── app/
│   ├── layout.tsx              # layout raíz con Nav
│   ├── page.tsx                # / leaderboard global
│   ├── stats/page.tsx          # /stats globales
│   ├── players/[uuid]/page.tsx # perfil de jugador
│   └── api/
│       ├── runs/route.ts       # POST — recibe run de Godot
│       ├── leaderboard/route.ts
│       ├── players/[uuid]/route.ts
│       └── stats/route.ts
├── components/
│   ├── Nav.tsx
│   └── StatCard.tsx
└── lib/
    ├── supabase.ts   # cliente Supabase
    ├── types.ts      # interfaces TypeScript
    ├── score.ts      # fórmula de score
    └── format.ts     # helpers de formateo
```

## DB (Supabase)
Tablas: `players`, `runs`. Ver `supabase/migrations/001_init.sql`.

## Fórmula de score
```
score = kills × 100 + floor(minutos) × 500 + floor(daño/1000) × 10
```

## Temática visual
Extraída del juego original:
- Fondo `#0F1220`, cards `#1A2948`, acento `#74CFFF`
- Fuentes: Cinzel (títulos) + Press Start 2P (números)

## Comandos
```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Deploy
Conectar repo a Vercel. Agregar las 4 variables de entorno en el dashboard de Vercel.
